const express = require('express');
const { getDatabase } = require('../db/init');

const router = express.Router();

// Track shipment by code (public endpoint)
router.get('/:code', (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: 'Tracking code required' });
  }

  try {
    const db = getDatabase();
    const shipment = db.prepare(
      'SELECT id, tracking_code, customer_name, origin, destination, status, created_at, updated_at FROM shipments WHERE tracking_code = ?'
    ).get(code.toUpperCase());

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    res.json(shipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Tracking failed' });
  }
});

module.exports = router;
