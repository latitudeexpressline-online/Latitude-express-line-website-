# Admin Dashboard Analytics & Audit Logs Documentation

## Overview

The enhanced Admin Dashboard includes three main sections:

1. **Shipments Management** - Create, view, and manage shipments
2. **Analytics Dashboard** - Real-time statistics and performance metrics
3. **Audit Logs** - Complete tracking of all system changes

---

## Dashboard Navigation

### Tab Structure

The dashboard uses tabbed navigation with three main sections:

```
📦 Shipments | 📊 Analytics | 📋 Audit Logs
```

Each tab is independently loadable and displays relevant data.

---

## 1. Shipments Tab

### Features

- **Create Shipments** - Add new shipments with customer information
- **View All Shipments** - Table view of all active shipments
- **Update Status** - Change shipment status with dropdown selector
- **Delete Shipments** - Remove shipments with confirmation
- **Status Options**:
  - Pending (Yellow) - Initial state
  - In Transit (Blue) - Shipment is on the way
  - Delivered (Green) - Successfully delivered
  - Cancelled (Red) - Shipment was cancelled

### Form Validation

All shipment creation forms validate:
- ✅ Customer name (2-100 characters)
- ✅ Email format (valid email address)
- ✅ Origin location (non-empty, 2-100 chars)
- ✅ Destination (non-empty, different from origin)

### Table Display

| Column | Description |
|--------|-------------|
| Tracking Code | Unique identifier (monospace) |
| Customer | Customer name |
| Route | Origin → Destination |
| Status | Dropdown selector with color coding |
| Created | Creation date |
| Actions | Delete button |

---

## 2. Analytics Tab

### Statistics Cards

Five key metric cards display at the top:

#### Total Shipments
- **Indicator**: Purple badge
- **Data**: Count of all shipments
- **Purpose**: Overall system activity

#### Pending
- **Indicator**: Yellow/Orange badge
- **Data**: Count of pending shipments
- **Purpose**: Identify new/queued shipments

#### In Transit
- **Indicator**: Blue badge
- **Data**: Count of in-transit shipments
- **Purpose**: Track active shipments

#### Delivered
- **Indicator**: Green badge
- **Data**: Count of delivered shipments
- **Purpose**: Success rate tracking

#### Cancelled
- **Indicator**: Red badge
- **Data**: Count of cancelled shipments
- **Purpose**: Issue tracking

### Chart 1: Status Distribution

**Type**: Horizontal bar chart with percentages

**Shows**:
- Breakdown of shipments by status
- Visual percentage representation
- Color-coded bars matching status colors

**Example**:
```
Pending:    ████████░░░░ 40%
In Transit: ██████░░░░░░ 30%
Delivered:  ███████░░░░░ 35%
Cancelled:  ██░░░░░░░░░░ 5%
```

**Use Case**: Identify system bottlenecks and shipment flow patterns

### Chart 2: System Activity

**Type**: Activity cards with action counts

**Tracks Three Actions**:

1. **Created (✓)** - Green icon
   - Count of all CREATE operations
   - New shipments added

2. **Updated (↻)** - Blue icon
   - Count of all UPDATE operations
   - Status changes, modifications

3. **Deleted (✕)** - Red icon
   - Count of all DELETE operations
   - Removed shipments

**Example**:
```
✓ Created:  152 total records created
↻ Updated:  487 total records updated
✕ Deleted:   12 total records deleted
```

**Use Case**: Monitor system activity and identify trends

### Analytics API Endpoints

#### Get All Audit Logs
```
GET /api/audit-logs
```
Returns last 500 audit log entries with admin information.

#### Filter by Table
```
GET /api/audit-logs/table/:tableName
```
- Supported tables: `shipments`, `admins`
- Returns 500 most recent entries for that table

#### Filter by Record
```
GET /api/audit-logs/record/:recordId
```
Returns all changes made to a specific record ID.

#### Filter by Admin
```
GET /api/audit-logs/admin/:adminId
```
Returns all actions performed by a specific admin.

#### Filter by Action Type
```
GET /api/audit-logs/action/:action
```
- Supported actions: `CREATE`, `UPDATE`, `DELETE`

#### Get Statistics Summary
```
GET /api/audit-logs/stats/summary
```
Returns:
- Action statistics (CREATE, UPDATE, DELETE counts)
- Table statistics (changes per table)
- Shipment status statistics
- Recent activity (24-hour breakdown)
- Total counts (shipments, admins, audit logs)

---

## 3. Audit Logs Tab

### Audit Log Table

Displays all system changes in a detailed table format.

### Columns

| Column | Description |
|--------|-------------|
| Date | Timestamp of change (formatted as "Mon DD, YYYY HH:MM") |
| Admin | Email of admin who made the change |
| Action | Badge showing CREATE, UPDATE, or DELETE |
| Table | Table name (shipments, admins) |
| Record ID | ID of affected record (clickable) |
| Details | Change description with hover information |

### Action Badges

**CREATE** (Green)
- Indicates new record creation
- Hover shows JSON of new values
- Example: "New record created"

**UPDATE** (Blue)
- Indicates existing record modification
- Hover shows: `Old: {...} → New: {...}`
- Example: "Status updated"

**DELETE** (Red)
- Indicates record deletion
- Hover shows JSON of deleted values
- Example: "Record deleted"

### Hover Details

Hovering over the Details cell shows:

```
CREATE: Full JSON of new values
UPDATE: Old values → New values transformation
DELETE: Full JSON of deleted values
```

Example:
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "origin": "New York",
  "destination": "Los Angeles",
  "status": "pending"
}
```

### Recent Activity Example

```
Date            | Admin              | Action | Table      | ID    | Details
2026-07-17 14:30| admin@company.com  | UPDATE | shipments  | #1    | Status updated
2026-07-17 14:25| admin@company.com  | CREATE | shipments  | #2    | New record created
2026-07-17 14:20| admin@company.com  | UPDATE | shipments  | #1    | Status updated
2026-07-17 14:10| support@company.com| DELETE | shipments  | #3    | Record deleted
```

---

## Data Capture in Audit Logs

### CREATE Operations
```json
{
  "table_name": "shipments",
  "record_id": 1,
  "action": "CREATE",
  "new_values": {
    "customer_name": "Jane Smith",
    "customer_email": "jane@example.com",
    "origin": "Chicago",
    "destination": "Denver",
    "status": "pending"
  },
  "admin_id": 1,
  "admin_email": "admin@company.com",
  "created_at": "2026-07-17 14:30:45"
}
```

### UPDATE Operations
```json
{
  "table_name": "shipments",
  "record_id": 1,
  "action": "UPDATE",
  "old_values": { "status": "pending" },
  "new_values": { "status": "in-transit" },
  "admin_id": 1,
  "admin_email": "admin@company.com",
  "created_at": "2026-07-17 14:31:15"
}
```

### DELETE Operations
```json
{
  "table_name": "shipments",
  "record_id": 1,
  "action": "DELETE",
  "old_values": {
    "tracking_code": "ABC123DEF456",
    "customer_name": "Jane Smith",
    "status": "pending"
  },
  "admin_id": 1,
  "admin_email": "admin@company.com",
  "created_at": "2026-07-17 14:32:00"
}
```

---

## Performance Optimizations

### Database Indexes

All audit log queries benefit from strategic indexes:

```sql
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Query Limits

- **Default fetch**: Last 500 entries
- **Maximum records**: ~500 per query
- **Rationale**: Balance between data completeness and performance

### Caching Strategy

- Dashboard statistics recalculate on tab click
- Audit logs refresh after each action
- Real-time updates ensure data accuracy

---

## Frontend Components

### AdminDashboard.jsx

**Main component structure**:

```javascript
// State management
const [activeTab, setActiveTab] = useState('shipments');
const [shipments, setShipments] = useState([]);
const [auditLogs, setAuditLogs] = useState([]);

// Data fetching
const fetchData = async () => {
  // Parallel fetch of shipments and audit logs
  const [shipmentsRes, auditRes] = await Promise.all([...]);
};

// Statistics generation
const getStatusStats = () => { /* Returns shipment status breakdown */ };
const getActionStats = () => { /* Returns audit action breakdown */ };

// Tab content rendering
{activeTab === 'shipments' && <ShipmentsContent />}
{activeTab === 'analytics' && <AnalyticsContent />}
{activeTab === 'audit' && <AuditContent />}
```

### CSS Classes

**Navigation**:
- `.dashboard-nav` - Tab container
- `.nav-btn` - Individual tab button
- `.nav-btn.active` - Active tab styling

**Analytics**:
- `.analytics-grid` - Stat cards grid
- `.stat-card` - Individual card
- `.charts-container` - Chart box container
- `.status-breakdown` - Horizontal bar chart
- `.activity-stats` - Activity summary cards

**Audit Logs**:
- `.audit-table` - Audit log table wrapper
- `.action-badge` - Action type badge
- `.record-id` - Record ID styling
- `.details-cell` - Details column styling

---

## Security Considerations

### Authentication

- All audit log endpoints require valid JWT token
- `authenticateToken` middleware validates requests
- Unauthorized access returns 401 Unauthorized

### Authorization

- All admins can view audit logs (no role-based restrictions currently)
- Future enhancement: Restrict access by admin role

### Data Protection

- Admin passwords hashed with bcryptjs
- Audit logs stored with admin ID for accountability
- No sensitive data (passwords, credit cards) logged
- Only business-relevant changes recorded

### SQL Injection Prevention

- All table name validation uses whitelist
- Parameterized queries for all data access
- Input validation on ID parameters

---

## Troubleshooting

### Audit Logs Not Appearing

**Problem**: Analytics tab shows no data

**Solution**:
1. Check browser console for errors
2. Verify `/api/audit-logs` endpoint is responding
3. Ensure JWT token is valid
4. Check database has audit_logs table

### Missing Admin Email in Logs

**Problem**: Admin column shows "System"

**Solution**:
- This occurs when admin_id doesn't match any active admin
- Check if admin was deleted but audit entries remain
- Expected behavior in soft-delete scenarios

### Performance Issues

**Problem**: Dashboard takes too long to load

**Solution**:
1. Check database indexes exist
2. Verify database connection speed
3. Consider archiving old audit logs
4. Check server resource usage

### Timestamp Formatting Issues

**Problem**: Dates display incorrectly

**Solution**:
1. Verify browser timezone settings
2. Check server is using UTC
3. Confirm Intl API support in browser
4. Update to modern browser version

---

## Future Enhancements

### Planned Features

1. **Advanced Filtering**
   - Date range picker
   - Multi-field filtering
   - Saved filter presets

2. **Export Functionality**
   - CSV export of audit logs
   - PDF report generation
   - Email report delivery

3. **Real-time Updates**
   - WebSocket connections
   - Live notification badges
   - Automatic refresh on changes

4. **Custom Dashboards**
   - User-customizable widgets
   - Saved dashboard layouts
   - Role-specific dashboards

5. **Advanced Analytics**
   - Shipment completion rates
   - Average delivery times
   - Geographic distribution
   - Trend analysis charts

6. **Compliance Reports**
   - GDPR audit trails
   - Compliance certification
   - Annual reports
   - Change tracking

---

## API Reference Summary

### Audit Logs Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/audit-logs` | GET | Get all audit logs (last 500) |
| `/api/audit-logs/table/:tableName` | GET | Filter by table name |
| `/api/audit-logs/record/:recordId` | GET | Get history of specific record |
| `/api/audit-logs/admin/:adminId` | GET | Get actions by specific admin |
| `/api/audit-logs/action/:action` | GET | Filter by action type |
| `/api/audit-logs/stats/summary` | GET | Get dashboard statistics |

### Response Format

**Success (200)**:
```json
[
  {
    "id": 1,
    "table_name": "shipments",
    "record_id": 1,
    "action": "UPDATE",
    "old_values": "{...}",
    "new_values": "{...}",
    "admin_id": 1,
    "admin_email": "admin@company.com",
    "created_at": "2026-07-17T14:30:45Z"
  }
]
```

**Error (4xx/5xx)**:
```json
{
  "error": "Failed to fetch audit logs"
}
```

---

## Support & Contact

For issues or questions:
1. Check database/server logs
2. Review API response status codes
3. Verify authentication credentials
4. Contact system administrator
5. Submit issue report with:
   - Error message
   - Timestamp
   - Browser details
   - Steps to reproduce
