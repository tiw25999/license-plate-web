import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './App.css';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import PlateManager from './components/PlateManager';
import LoginPage from './components/pages/LoginPage';
import AdminPage from './components/Admin/AdminPage';

// Route Guards
import PrivateRoute from './routes/PrivateRoute';
import { AdminRoute } from './routes/AdminRoute';

// Layouts
import GuestLayout from './layouts/GuestLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public (Guest) */}
          <Route
            path="/login"
            element={
              <GuestLayout>
                <LoginPage />
              </GuestLayout>
            }
          />

          {/* Protected (Logged-in users only) */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <UserLayout>
                  <PlateManager />
                </UserLayout>
              </PrivateRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminPage />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
