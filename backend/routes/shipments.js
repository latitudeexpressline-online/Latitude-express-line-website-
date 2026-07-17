const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const { getDatabase } = require('../db/init');
const { validateShipmentData, validateStatus } = require('../utils/validation');

const router = express.Router();

// Create shipment (admin only)
router.post('/', authenticateToken, (req, res) => {
  const { customer_name, customer_email, origin, destination } = req.body;

  // Validate input data
  const validation = validateShipmentData({
    customer_name,
    customer_email,
    origin,
    destination
  });

  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const db = getDatabase();
    const tracking_code = uuidv4().substring(0, 12).toUpperCase();

    const result = db.prepare(`
      INSERT INTO shipments (tracking_code, customer_name, customer_email, origin, destination, status, created_by_admin_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      tracking_code,
      validation.data.customer_name,
      validation.data.customer_email,
      validation.data.origin,
      validation.data.destination,
      'pending',
      req.admin.id
    );

    // Log to audit trail
    db.prepare(`
      INSERT INTO audit_logs (table_name, record_id, action, new_values, admin_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'shipments',
      result.lastInsertRowid,
      'CREATE',
      JSON.stringify(validation.data),
      req.admin.id
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      tracking_code,
      customer_name: validation.data.customer_name,
      customer_email: validation.data.customer_email,
      origin: validation.data.origin,
      destination: validation.data.destination,
      status: 'pending'
    });
  } catch (error) {
    if (error.message.includes('CHECK')) {
      return res.status(400).json({ error: 'Invalid data - check constraints failed' });
    }
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Tracking code already exists' });
    }
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

// Get shipment by ID (admin only)
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Validate ID is a number
  if (!Number.isInteger(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid shipment ID' });
  }

  try {
    const db = getDatabase();
    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(id);

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

// Update shipment status (admin only)
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate ID
  if (!Number.isInteger(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid shipment ID' });
  }

  // Validate status
  const statusValidation = validateStatus(status);
  if (!statusValidation.valid) {
    return res.status(400).json({ error: statusValidation.error });
  }

  try {
    const db = getDatabase();

    // Get old values for audit log
    const oldShipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(id);
    if (!oldShipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Update shipment
    db.prepare('UPDATE shipments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(statusValidation.value, id);

    // Get updated shipment
    const updatedShipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(id);

    // Log to audit trail
    db.prepare(`
      INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, admin_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'shipments',
      id,
      'UPDATE',
      JSON.stringify({ status: oldShipment.status }),
      JSON.stringify({ status: statusValidation.value }),
      req.admin.id
    );

    res.json(updatedShipment);
  } catch (error) {
    if (error.message.includes('CHECK')) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to update shipment' });
  }
});

// Delete shipment (admin only)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!Number.isInteger(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid shipment ID' });
  }

  try {
    const db = getDatabase();

    // Get shipment before deletion for audit log
    const shipment = db.prepare('SELECT * FROM shipments WHERE id = ?').get(id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Delete shipment
    db.prepare('DELETE FROM shipments WHERE id = ?').run(id);

    // Log to audit trail
    db.prepare(`
      INSERT INTO audit_logs (table_name, record_id, action, old_values, admin_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'shipments',
      id,
      'DELETE',
      JSON.stringify(shipment),
      req.admin.id
    );

    res.json({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete shipment' });
  }
});

module.exports = router;
