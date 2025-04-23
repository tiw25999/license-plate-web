import 'bootstrap-icons/font/bootstrap-icons.css'; // เพิ่ม import สำหรับ bootstrap icons
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import PlateManager from './components/PlateManager';
import AdminPage from './components/pages/AdminPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import { AuthProvider } from './contexts/AuthContext';

// Component สำหรับป้องกันหน้าที่ต้องการ login
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Component สำหรับป้องกันหน้า admin
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <nav className="navbar navbar-dark bg-dark">
            <div className="container">
              <a href="/" className="navbar-brand mb-0 h1">License Plate Detection System</a>
            </div>
          </nav>
          
          <Routes>
            <Route path="/" element={<PlateManager />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              } 
            />
            {/* ใช้ PrivateRoute สำหรับหน้าที่ต้องการการเข้าสู่ระบบ */}
            <Route 
              path="/protected-page" 
              element={
                <PrivateRoute>
                  <PlateManager />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;