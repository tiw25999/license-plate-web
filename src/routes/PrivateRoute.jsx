import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ใช้ครอบ <Route> ที่ต้องการให้เฉพาะผู้ที่ login เข้ามาแล้วเท่านั้น
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
