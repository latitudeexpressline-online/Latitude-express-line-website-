import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard({ token, adminEmail, onLogout }) {
  const [shipments, setShipments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('shipments'); // 'shipments', 'analytics', 'audit'
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    origin: '',
    destination: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shipmentsRes, auditRes] = await Promise.all([
        axios.get('/api/shipments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/audit-logs', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setShipments(shipmentsRes.data);
      setAuditLogs(auditRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const stats = {
      pending: 0,
      'in-transit': 0,
      delivered: 0,
      cancelled: 0,
      total: shipments.length
    };

    shipments.forEach(shipment => {
      if (stats[shipment.status] !== undefined) {
        stats[shipment.status]++;
      }
    });

    return stats;
  };

  const getActionStats = () => {
    const stats = {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0
    };

    auditLogs.forEach(log => {
      if (stats[log.action] !== undefined) {
        stats[log.action]++;
      }
    });

    return stats;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => (
      { ...prev, [name]: value }
    ));
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post('/api/shipments', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShipments(prev => [response.data, ...prev]);
      setFormData({
        customer_name: '',
        customer_email: '',
        origin: '',
        destination: ''
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create shipment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await axios.put(
        `/api/shipments/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShipments(prev =>
        prev.map(s => (s.id === id ? response.data : s))
      );
      fetchData(); // Refresh audit logs
    } catch (err) {
      setError('Failed to update shipment');
    }
  };

  const handleDeleteShipment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;

    try {
      await axios.delete(`/api/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShipments(prev => prev.filter(s => s.id !== id));
      fetchData(); // Refresh audit logs
    } catch (err) {
      setError('Failed to delete shipment');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login');
  };

  const stats = getStatusStats();
  const actionStats = getActionStats();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span className="admin-email">{adminEmail}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'shipments' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipments')}
        >
          📦 Shipments
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
        <button
          className={`nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📋 Audit Logs
        </button>
      </nav>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <>
            <div className="action-bar">
              <button
                className="create-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : '+ Create Shipment'}
              </button>
            </div>

            {showForm && (
              <div className="create-form">
                <h2>Create New Shipment</h2>
                <form onSubmit={handleCreateShipment}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Customer Name:</label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleFormChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer Email:</label>
                      <input
                        type="email"
                        name="customer_email"
                        value={formData.customer_email}
                        onChange={handleFormChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Origin:</label>
                      <input
                        type="text"
                        name="origin"
                        value={formData.origin}
                        onChange={handleFormChange}
                        placeholder="e.g., New York"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div className="form-group">
                      <label>Destination:</label>
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleFormChange}
                        placeholder="e.g., Los Angeles"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Creating...' : 'Create Shipment'}
                  </button>
                </form>
              </div>
            )}

            <div className="shipments-section">
              <h2>Shipments</h2>
              {loading ? (
                <p className="loading">Loading shipments...</p>
              ) : shipments.length === 0 ? (
                <p className="no-data">No shipments yet. Create one to get started!</p>
              ) : (
                <div className="shipments-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Tracking Code</th>
                        <th>Customer</th>
                        <th>Route</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map(shipment => (
                        <tr key={shipment.id}>
                          <td className="tracking-code">{shipment.tracking_code}</td>
                          <td>{shipment.customer_name}</td>
                          <td>{shipment.origin} → {shipment.destination}</td>
                          <td>
                            <select
                              value={shipment.status}
                              onChange={(e) => handleUpdateStatus(shipment.id, e.target.value)}
                              className={`status-select status-${shipment.status}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="in-transit">In Transit</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>{new Date(shipment.created_at).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteShipment(shipment.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Dashboard Analytics</h2>

            <div className="analytics-grid">
              <div className="stat-card total">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Shipments</div>
              </div>

              <div className="stat-card pending">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">Pending</div>
              </div>

              <div className="stat-card in-transit">
                <div className="stat-value">{stats['in-transit']}</div>
                <div className="stat-label">In Transit</div>
              </div>

              <div className="stat-card delivered">
                <div className="stat-value">{stats.delivered}</div>
                <div className="stat-label">Delivered</div>
              </div>

              <div className="stat-card cancelled">
                <div className="stat-value">{stats.cancelled}</div>
                <div className="stat-label">Cancelled</div>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-box">
                <h3>Status Distribution</h3>
                <div className="status-breakdown">
                  {stats.total === 0 ? (
                    <p className="no-data">No data available</p>
                  ) : (
                    <>
                      <div className="breakdown-item pending">
                        <span className="label">Pending</span>
                        <div className="bar" style={{ width: `${(stats.pending / stats.total) * 100}%` }}></div>
                        <span className="percent">{Math.round((stats.pending / stats.total) * 100)}%</span>
                      </div>
                      <div className="breakdown-item in-transit">
                        <span className="label">In Transit</span>
                        <div className="bar" style={{ width: `${(stats['in-transit'] / stats.total) * 100}%` }}></div>
                        <span className="percent">{Math.round((stats['in-transit'] / stats.total) * 100)}%</span>
                      </div>
                      <div className="breakdown-item delivered">
                        <span className="label">Delivered</span>
                        <div className="bar" style={{ width: `${(stats.delivered / stats.total) * 100}%` }}></div>
                        <span className="percent">{Math.round((stats.delivered / stats.total) * 100)}%</span>
                      </div>
                      <div className="breakdown-item cancelled">
                        <span className="label">Cancelled</span>
                        <div className="bar" style={{ width: `${(stats.cancelled / stats.total) * 100}%` }}></div>
                        <span className="percent">{Math.round((stats.cancelled / stats.total) * 100)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="chart-box">
                <h3>System Activity</h3>
                <div className="activity-stats">
                  <div className="activity-item">
                    <span className="action-icon create">✓</span>
                    <div className="activity-info">
                      <div className="activity-label">Created</div>
                      <div className="activity-count">{actionStats.CREATE}</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="action-icon update">↻</span>
                    <div className="activity-info">
                      <div className="activity-label">Updated</div>
                      <div className="activity-count">{actionStats.UPDATE}</div>
                    </div>
                  </div>
                  <div className="activity-item">
                    <span className="action-icon delete">✕</span>
                    <div className="activity-info">
                      <div className="activity-label">Deleted</div>
                      <div className="activity-count">{actionStats.DELETE}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="audit-section">
            <h2>Audit Logs</h2>
            {loading ? (
              <p className="loading">Loading audit logs...</p>
            ) : auditLogs.length === 0 ? (
              <p className="no-data">No audit logs yet</p>
            ) : (
              <div className="audit-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Admin</th>
                      <th>Action</th>
                      <th>Table</th>
                      <th>Record ID</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{formatDate(log.created_at)}</td>
                        <td>{log.admin_email || 'System'}</td>
                        <td>
                          <span className={`action-badge action-${log.action.toLowerCase()}`}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.table_name}</td>
                        <td className="record-id">#{log.record_id}</td>
                        <td className="details-cell">
                          {log.action === 'CREATE' && (
                            <span title={log.new_values}>New record created</span>
                          )}
                          {log.action === 'UPDATE' && (
                            <span title={`Old: ${log.old_values} → New: ${log.new_values}`}>
                              Status updated
                            </span>
                          )}
                          {log.action === 'DELETE' && (
                            <span title={log.old_values}>Record deleted</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
