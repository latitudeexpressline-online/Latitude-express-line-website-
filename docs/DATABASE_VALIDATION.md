## Database Validation & Constraints Documentation

This document outlines all validation rules, database constraints, and audit logging implemented in the Latitude Express Line system.

---

## Database-Level Constraints

### 1. **Admins Table Constraints**

```sql
CHECK (length(trim(email)) > 0)
```
- Email cannot be empty or contain only whitespace

```sql
CHECK (email LIKE '%@%.%')
```
- Email must follow valid format (contains @ and domain)
- Prevents invalid email addresses at database level

```sql
CHECK (length(password) >= 8)
```
- Password must be at least 8 characters (enforced at DB)

```sql
CHECK (is_active IN (0, 1))
```
- Boolean column accepts only 0 or 1
- Used for soft-delete functionality

### 2. **Shipments Table Constraints**

```sql
CHECK (length(trim(tracking_code)) > 0)
```
- Tracking code cannot be empty

```sql
CHECK (length(trim(customer_name)) > 0)
```
- Customer name is required and cannot be whitespace-only

```sql
CHECK (length(trim(customer_email)) > 0)
```
- Customer email cannot be empty

```sql
CHECK (customer_email LIKE '%@%.%')
```
- Customer email must be in valid format

```sql
CHECK (length(trim(origin)) > 0)
```
- Origin location required

```sql
CHECK (length(trim(destination)) > 0)
```
- Destination location required

```sql
CHECK (status IN ('pending', 'in-transit', 'delivered', 'cancelled'))
```
- Only valid status values allowed
- Prevents invalid status strings

```sql
CHECK (origin != destination)
```
- Origin and destination must be different
- Prevents logical errors in shipment data

### 3. **Foreign Key Constraints**

```sql
FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
```
- Links shipments to the admin who created them
- On admin deletion, shipment reference is set to NULL
- Maintains referential integrity

### 4. **Audit Logs Table Constraints**

```sql
CHECK (action IN ('CREATE', 'UPDATE', 'DELETE'))
```
- Only valid audit actions recorded

```sql
CHECK (length(trim(table_name)) > 0)
```
- Table name required

---

## Application-Level Validation

### Email Validation
**Function:** `validateEmail(email)`

**Rules:**
- Must be a string
- Cannot be empty or whitespace-only
- Maximum 255 characters
- Must match format: `user@domain.ext`
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Error Handling:**
- Returns object with `valid` flag and `error` message
- Examples:
  ```javascript
  // Valid
  validateEmail('admin@company.com')
  // { valid: true, value: 'admin@company.com' }

  // Invalid
  validateEmail('invalid-email')
  // { valid: false, error: 'Email format is invalid' }
  ```

### Password Validation
**Function:** `validatePassword(password)`

**Rules:**
- Must be a string
- Minimum 8 characters
- Maximum 128 characters
- Must contain at least one UPPERCASE letter
- Must contain at least one lowercase letter
- Must contain at least one number (0-9)

**Error Handling:**
```javascript
// Weak password (no uppercase)
validatePassword('password123')
// { valid: false, error: 'Password must contain uppercase, lowercase, and numeric characters' }

// Valid
validatePassword('SecurePass123')
// { valid: true }
```

**Password Strength Requirements:**
- ✅ At least one uppercase: A-Z
- ✅ At least one lowercase: a-z
- ✅ At least one number: 0-9
- ✅ Minimum 8 characters total

### Customer Name Validation
**Function:** `validateCustomerName(name)`

**Rules:**
- Must be a string
- Cannot be empty or whitespace-only
- Minimum 2 characters
- Maximum 100 characters
- Trimmed before storage

**Examples:**
```javascript
validateCustomerName('John Doe')
// { valid: true, value: 'John Doe' }

validateCustomerName('A')
// { valid: false, error: 'Customer name must be at least 2 characters' }
```

### Location Validation
**Function:** `validateLocation(location)` (used for origin & destination)

**Rules:**
- Must be a string
- Cannot be empty or whitespace-only
- Minimum 2 characters
- Maximum 100 characters
- Trimmed before storage

**Examples:**
```javascript
validateLocation('New York')
// { valid: true, value: 'New York' }

validateLocation('LA')
// { valid: true, value: 'LA' }

validateLocation('')
// { valid: false, error: 'Location cannot be empty' }
```

### Status Validation
**Function:** `validateStatus(status)`

**Valid Statuses:**
1. `pending` - Initial state after shipment creation
2. `in-transit` - Shipment is on the way
3. `delivered` - Shipment reached destination
4. `cancelled` - Shipment was cancelled

**Rules:**
- Case-insensitive (automatically converted to lowercase)
- Must be one of the valid statuses
- Trimmed before validation

**Examples:**
```javascript
validateStatus('PENDING')
// { valid: true, value: 'pending' }

validateStatus('invalid')
// { valid: false, error: 'Status must be one of: pending, in-transit, delivered, cancelled' }
```

### Tracking Code Validation
**Function:** `validateTrackingCode(code)`

**Rules:**
- Must be a string
- Cannot be empty
- Maximum 20 characters
- Alphanumeric characters (A-Z, 0-9) and hyphens only
- Automatically converted to uppercase

**Format:** `[A-Z0-9-]{1,20}`

**Examples:**
```javascript
validateTrackingCode('abc-123-def')
// { valid: true, value: 'ABC-123-DEF' }

validateTrackingCode('invalid@code')
// { valid: false, error: 'Tracking code must contain only letters, numbers, and hyphens' }
```

### Shipment Data Validation
**Function:** `validateShipmentData(data)`

**Rules:**
- Validates all fields: customer_name, customer_email, origin, destination
- Returns all errors at once (no early exit)
- Origin and destination must be different

**Return Format:**
```javascript
// Success
{
  valid: true,
  data: {
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    origin: 'New York',
    destination: 'Los Angeles'
  }
}

// Error
{
  valid: false,
  errors: [
    'Email format is invalid',
    'Origin and destination must be different'
  ]
}
```

### Admin Data Validation
**Function:** `validateAdminData(data)`

**Rules:**
- Validates email and password
- Returns all validation errors as array

**Return Format:**
```javascript
// Success
{
  valid: true,
  data: {
    email: 'admin@company.com'
  }
}

// Error
{
  valid: false,
  errors: [
    'Email format is invalid',
    'Password must be at least 8 characters long'
  ]
}
```

---

## Database Indexes

Indexes are created for frequently queried columns to improve performance:

```sql
CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_is_active ON admins(is_active);
CREATE INDEX idx_shipments_tracking_code ON shipments(tracking_code);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_customer_email ON shipments(customer_email);
CREATE INDEX idx_shipments_created_by_admin_id ON shipments(created_by_admin_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## Audit Logging

Every data modification (CREATE, UPDATE, DELETE) is logged to the `audit_logs` table.

### Audit Log Schema

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| table_name | TEXT | Name of modified table |
| record_id | INTEGER | ID of modified record |
| action | TEXT | CREATE, UPDATE, or DELETE |
| old_values | TEXT | JSON of previous values |
| new_values | TEXT | JSON of new values |
| admin_id | INTEGER | Admin who made the change |
| created_at | DATETIME | Timestamp of the change |

### Audit Trail Examples

**CREATE Shipment:**
```json
{
  "table_name": "shipments",
  "record_id": 1,
  "action": "CREATE",
  "new_values": "{\"customer_name\":\"John Doe\",\"customer_email\":\"john@example.com\",\"origin\":\"New York\",\"destination\":\"Los Angeles\"}",
  "admin_id": 1
}
```

**UPDATE Status:**
```json
{
  "table_name": "shipments",
  "record_id": 1,
  "action": "UPDATE",
  "old_values": "{\"status\":\"pending\"}",
  "new_values": "{\"status\":\"in-transit\"}",
  "admin_id": 1
}
```

**DELETE Shipment:**
```json
{
  "table_name": "shipments",
  "record_id": 1,
  "action": "DELETE",
  "old_values": "{\"tracking_code\":\"ABC123DEF456\",\"customer_name\":\"John Doe\",\"status\":\"pending\"}",
  "admin_id": 1
}
```

---

## API Error Responses

### Validation Error Response

```json
{
  "errors": [
    "Email format is invalid",
    "Password must contain uppercase, lowercase, and numeric characters"
  ]
}
```
**Status Code:** `400 Bad Request`

### Single Error Response

```json
{
  "error": "Email already exists"
}
```
**Status Code:** `400 Bad Request` or `401 Unauthorized` or `500 Internal Server Error`

### Constraint Violation Response

```json
{
  "error": "Invalid data - check constraints failed"
}
```
**Status Code:** `400 Bad Request`

---

## Security Considerations

### 1. **SQL Injection Prevention**
- All queries use parameterized statements
- User input never directly concatenated into SQL

### 2. **Password Security**
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Strong password requirements enforced

### 3. **Email Validation**
- Format validation prevents malformed emails
- Database constraints provide additional protection

### 4. **Audit Trail**
- All changes tracked with admin ID
- Timestamp recorded for accountability
- Soft-delete support via `is_active` flag

### 5. **Input Trimming**
- Whitespace automatically trimmed from all text inputs
- Prevents database bloat and inconsistencies

---

## Database Initialization

To enable all validations, the database must be initialized with:

```javascript
const { initializeDatabase } = require('./db/init');
initializeDatabase();
```

This creates:
- ✅ Admins table with constraints
- ✅ Shipments table with constraints and foreign keys
- ✅ Audit logs table
- ✅ All performance indexes
- ✅ Foreign key support enabled (`PRAGMA foreign_keys = ON`)
- ✅ WAL mode enabled for better concurrency

---

## Testing Validation

### Test Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"SecurePass123"}'
```

### Test Weak Password
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"weak"}'
```

### Test Same Origin/Destination
```bash
curl -X POST http://localhost:5000/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"John","customer_email":"john@example.com","origin":"NYC","destination":"NYC"}'
```

### Test Invalid Status
```bash
curl -X PUT http://localhost:5000/api/shipments/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"invalid_status"}'
```

---

## Summary

| Feature | Implementation |
|---------|-----------------|
| Email Validation | Regex + DB CHECK |
| Password Security | Strong requirements + bcrypt hashing |
| Data Integrity | Foreign keys + CHECK constraints |
| Audit Trail | Comprehensive logging of all changes |
| Performance | Strategic indexes on frequently queried columns |
| Type Safety | Input validation at application level |
| Error Handling | Detailed error messages for debugging |
| Data Consistency | Automatic trimming + normalization |

All validations work together to ensure data quality, security, and system reliability.
