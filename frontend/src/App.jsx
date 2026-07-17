import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TrackingPage from './pages/TrackingPage';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('adminEmail'));

  const handleLogout = () => {
    setToken(null);
    setAdminEmail(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrackingPage />} />
        <Route
          path="/admin/login"
          element={
            token ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <AdminLogin onLogin={(t, e) => {
                setToken(t);
                setAdminEmail(e);
                localStorage.setItem('adminToken', t);
                localStorage.setItem('adminEmail', e);
              }} />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            token ? (
              <AdminDashboard token={token} adminEmail={adminEmail} onLogout={handleLogout} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
