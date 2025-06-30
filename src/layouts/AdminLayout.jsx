import React from 'react';

const AdminLayout = ({ children }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container d-flex justify-content-between align-items-center">
          <a href="/" className="navbar-brand mb-0 h1">Admin Panel</a>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
        </div>
      </nav>
      <div className="container mt-4">{children}</div>
    </>
  );
};

export default AdminLayout;
