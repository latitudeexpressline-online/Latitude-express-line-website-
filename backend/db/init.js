const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../shipments.db');
let db = null;

function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    // Enable foreign keys and other safety features
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
  }
  return db;
}

function initializeDatabase() {
  const database = getDatabase();

  // Create admins table with comprehensive constraints
  database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Constraints
      CHECK (length(trim(email)) > 0),
      CHECK (email LIKE '%@%.%'),
      CHECK (length(password) >= 8),
      CHECK (is_active IN (0, 1))
    )
  `);

  // Create shipments table with comprehensive constraints
  database.exec(`
    CREATE TABLE IF NOT EXISTS shipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_code TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_by_admin_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Constraints
      CHECK (length(trim(tracking_code)) > 0),
      CHECK (length(trim(customer_name)) > 0),
      CHECK (length(trim(customer_email)) > 0),
      CHECK (customer_email LIKE '%@%.%'),
      CHECK (length(trim(origin)) > 0),
      CHECK (length(trim(destination)) > 0),
      CHECK (status IN ('pending', 'in-transit', 'delivered', 'cancelled')),
      CHECK (origin != destination),
      
      -- Foreign key constraint
      FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
    )
  `);

  // Create audit log table to track changes
  database.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      old_values TEXT,
      new_values TEXT,
      admin_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- Constraints
      CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
      CHECK (length(trim(table_name)) > 0),
      
      -- Foreign key constraint
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    )
  `);

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    CREATE INDEX IF NOT EXISTS idx_admins_is_active ON admins(is_active);
    CREATE INDEX IF NOT EXISTS idx_shipments_tracking_code ON shipments(tracking_code);
    CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
    CREATE INDEX IF NOT EXISTS idx_shipments_customer_email ON shipments(customer_email);
    CREATE INDEX IF NOT EXISTS idx_shipments_created_by_admin_id ON shipments(created_by_admin_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
  `);

  console.log('Database initialized successfully with constraints and validations');
}

module.exports = { getDatabase, initializeDatabase };
