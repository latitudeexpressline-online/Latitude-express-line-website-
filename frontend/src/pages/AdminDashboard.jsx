import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard({ token, adminEmail, onLogout }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await axios.get('/api/shipments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShipments(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch shipments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    } catch (err) {
      setError('Failed to delete shipment');
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/admin/login');
  };

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

      <main className="dashboard-main">
        <div className="action-bar">
          <button
            className="create-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Create Shipment'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

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
      </main>
    </div>
  );
}

export default AdminDashboard;
