const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { getDatabase } = require('../db/init');
const { validateEmail, validatePassword, validateAdminData } = require('../utils/validation');

const router = express.Router();

// Admin login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const db = getDatabase();
    const admin = db.prepare('SELECT * FROM admins WHERE email = ? AND is_active = 1').get(email.trim());

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = bcryptjs.compareSync(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, email: admin.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Create admin (for initial setup, should be protected in production)
router.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  const validation = validateAdminData({ email, password });
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const db = getDatabase();
    const hashedPassword = bcryptjs.hashSync(password, 10);

    const result = db.prepare(
      'INSERT INTO admins (email, password, is_active) VALUES (?, ?, 1)'
    ).run(validation.data.email, hashedPassword);

    res.status(201).json({
      message: 'Admin account created successfully',
      id: result.lastInsertRowid,
      email: validation.data.email
    });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    if (error.message.includes('CHECK')) {
      return res.status(400).json({ error: 'Invalid data - check constraints failed' });
    }
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

module.exports = router;
