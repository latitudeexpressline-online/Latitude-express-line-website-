const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getDatabase } = require('../db/init');

const router = express.Router();

// Get all audit logs (admin only)
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();
    
    // Fetch audit logs with admin email information
    const auditLogs = db.prepare(`
      SELECT 
        al.id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.admin_id,
        a.email as admin_email,
        al.created_at
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      ORDER BY al.created_at DESC
      LIMIT 500
    `).all();

    res.json(auditLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs for a specific table (admin only)
router.get('/table/:tableName', authenticateToken, (req, res) => {
  const { tableName } = req.params;

  // Validate table name to prevent SQL injection
  const validTables = ['shipments', 'admins'];
  if (!validTables.includes(tableName)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const db = getDatabase();
    
    const auditLogs = db.prepare(`
      SELECT 
        al.id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.admin_id,
        a.email as admin_email,
        al.created_at
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      WHERE al.table_name = ?
      ORDER BY al.created_at DESC
      LIMIT 500
    `).all(tableName);

    res.json(auditLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs for a specific record (admin only)
router.get('/record/:recordId', authenticateToken, (req, res) => {
  const { recordId } = req.params;

  // Validate record ID
  if (!Number.isInteger(parseInt(recordId))) {
    return res.status(400).json({ error: 'Invalid record ID' });
  }

  try {
    const db = getDatabase();
    
    const auditLogs = db.prepare(`
      SELECT 
        al.id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.admin_id,
        a.email as admin_email,
        al.created_at
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      WHERE al.record_id = ?
      ORDER BY al.created_at DESC
    `).all(recordId);

    res.json(auditLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs for a specific admin (admin only)
router.get('/admin/:adminId', authenticateToken, (req, res) => {
  const { adminId } = req.params;

  // Validate admin ID
  if (!Number.isInteger(parseInt(adminId))) {
    return res.status(400).json({ error: 'Invalid admin ID' });
  }

  try {
    const db = getDatabase();
    
    const auditLogs = db.prepare(`
      SELECT 
        al.id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.admin_id,
        a.email as admin_email,
        al.created_at
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      WHERE al.admin_id = ?
      ORDER BY al.created_at DESC
      LIMIT 500
    `).all(adminId);

    res.json(auditLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit logs for a specific action type (admin only)
router.get('/action/:action', authenticateToken, (req, res) => {
  const { action } = req.params;

  // Validate action
  const validActions = ['CREATE', 'UPDATE', 'DELETE'];
  if (!validActions.includes(action.toUpperCase())) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  try {
    const db = getDatabase();
    
    const auditLogs = db.prepare(`
      SELECT 
        al.id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.admin_id,
        a.email as admin_email,
        al.created_at
      FROM audit_logs al
      LEFT JOIN admins a ON al.admin_id = a.id
      WHERE al.action = ?
      ORDER BY al.created_at DESC
      LIMIT 500
    `).all(action.toUpperCase());

    res.json(auditLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get statistics dashboard
router.get('/stats/summary', authenticateToken, (req, res) => {
  try {
    const db = getDatabase();

    // Get action statistics
    const actionStats = db.prepare(`
      SELECT 
        action,
        COUNT(*) as count
      FROM audit_logs
      GROUP BY action
    `).all();

    // Get table statistics
    const tableStats = db.prepare(`
      SELECT 
        table_name,
        COUNT(*) as count
      FROM audit_logs
      GROUP BY table_name
    `).all();

    // Get shipment status statistics
    const shipmentStats = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM shipments
      GROUP BY status
    `).all();

    // Get recent activity (last 24 hours)
    const recentActivity = db.prepare(`
      SELECT 
        COUNT(*) as count,
        DATE(created_at) as date
      FROM audit_logs
      WHERE created_at > datetime('now', '-24 hours')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();

    // Get total counts
    const totals = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM shipments) as total_shipments,
        (SELECT COUNT(*) FROM admins WHERE is_active = 1) as total_admins,
        (SELECT COUNT(*) FROM audit_logs) as total_audit_logs
    `).get();

    res.json({
      actionStats,
      tableStats,
      shipmentStats,
      recentActivity,
      totals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
