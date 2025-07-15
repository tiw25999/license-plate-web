// AdminLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          {/* Brand */}
          <Link to="/admin" className="navbar-brand mb-0 h1">Admin Panel</Link>

          {/* Toggler for mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#adminNavbar"
            aria-controls="adminNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="adminNavbar">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/admin" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/admin/user-panel" className="nav-link">User Panel</Link>
              </li>
            </ul>
            <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        {children}
      </div>
    </>
  );
};

export default AdminLayout;
