import React, { useState } from 'react';
import axios from 'axios';
import './TrackingPage.css';

function TrackingPage() {
  const [trackingCode, setTrackingCode] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setShipment(null);
    setSearched(true);
    setLoading(true);

    try {
      const response = await axios.get(`/api/track/${trackingCode.trim()}`);
      setShipment(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Tracking code not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '📦';
      case 'in-transit':
        return '🚚';
      case 'delivered':
        return '✓';
      default:
        return '📍';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'in-transit':
        return '#3498db';
      case 'delivered':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="tracking-page">
      <header className="tracking-header">
        <div className="header-content">
          <h1>Latitude Express Line</h1>
          <p>Track Your Shipment</p>
        </div>
      </header>

      <main className="tracking-main">
        <div className="tracking-container">
          <form onSubmit={handleSearch} className="tracking-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter your tracking code"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                disabled={loading}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
          </form>

          {error && searched && (
            <div className="error-box">
              <p className="error-icon">❌</p>
              <p className="error-text">{error}</p>
              <p className="error-hint">Please check your tracking code and try again</p>
            </div>
          )}

          {shipment && (
            <div className="shipment-details">
              <div className="status-header">
                <div className="status-icon" style={{ color: getStatusColor(shipment.status) }}>
                  {getStatusIcon(shipment.status)}
                </div>
                <div className="status-info">
                  <h2 className="status-title" style={{ color: getStatusColor(shipment.status) }}>
                    {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                  </h2>
                  <p className="tracking-code-display">{shipment.tracking_code}</p>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <label>Customer Name</label>
                  <p>{shipment.customer_name}</p>
                </div>
                <div className="detail-item">
                  <label>Origin</label>
                  <p>{shipment.origin}</p>
                </div>
                <div className="detail-item">
                  <label>Destination</label>
                  <p>{shipment.destination}</p>
                </div>
                <div className="detail-item">
                  <label>Created Date</label>
                  <p>{new Date(shipment.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="status-timeline">
                <div className="timeline-item" style={{ borderColor: getStatusColor(shipment.status) }}>
                  <div className="timeline-dot pending" style={{ 
                    backgroundColor: shipment.status !== 'pending' ? getStatusColor('pending') : '#bdc3c7'
                  }}></div>
                  <div className="timeline-label">Pending</div>
                </div>
                <div className="timeline-line" style={{ 
                  backgroundColor: shipment.status !== 'pending' ? '#27ae60' : '#bdc3c7'
                }}></div>
                <div className="timeline-item" style={{ borderColor: getStatusColor(shipment.status) }}>
                  <div className="timeline-dot in-transit" style={{ 
                    backgroundColor: ['in-transit', 'delivered'].includes(shipment.status) ? getStatusColor('in-transit') : '#bdc3c7'
                  }}></div>
                  <div className="timeline-label">In Transit</div>
                </div>
                <div className="timeline-line" style={{ 
                  backgroundColor: shipment.status === 'delivered' ? '#27ae60' : '#bdc3c7'
                }}></div>
                <div className="timeline-item" style={{ borderColor: getStatusColor(shipment.status) }}>
                  <div className="timeline-dot delivered" style={{ 
                    backgroundColor: shipment.status === 'delivered' ? getStatusColor('delivered') : '#bdc3c7'
                  }}></div>
                  <div className="timeline-label">Delivered</div>
                </div>
              </div>
            </div>
          )}

          {!shipment && !error && (
            <div className="info-box">
              <p className="info-icon">📦</p>
              <p className="info-text">Enter your tracking code to see shipment status</p>
            </div>
          )}
        </div>
      </main>

      <footer className="tracking-footer">
        <p>&copy; 2024 Latitude Express Line. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default TrackingPage;
