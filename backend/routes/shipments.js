const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { getDatabase } = require('../db/init');

const router = express.Router();

// Create shipment (admin only)
router.post('/', authenticateToken, (req, res) => {
  const { customer_name, customer_email, origin, destination } = req.body;

  if (!customer_name || !customer_email || !origin || !destination) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const db = getDatabase();
    const tracking_code = uuidv4().substring(0, 12).toUpperCase();

    const result = db.prepare(`
      INSERT INTO shipments (tracking_code, customer_name, customer_email, origin, destination, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tracking_code, customer_name, customer_email, origin, destination, 'pending');

    res.status(201).json({
      id: result.lastInsertRowid,
      tracking_code,
      customer_name,
      customer_email,
      origin,
      destination,
      status: 'pending'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

// List all shipments (admin only)
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    const shipments = db.prepare('SELECT * FROM shipments ORDER BY created_at DESC').all();
    res.json(shipments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Update shipment status (admin only)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status required' });
  }

  try {
    const db = getDatabase();
    db.prepare('UPDATE shipments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status, id);

    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(id);
    res.json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Delete shipment (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const db = getDatabase();
    db.prepare('DELETE FROM shipments WHERE id = ?').run(id);
    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

module.exports = router;
