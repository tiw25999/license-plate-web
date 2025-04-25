import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthStatus = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="auth-status d-flex align-items-center">
      {user ? (
        <>
          <span className="me-2">
            สวัสดี, {user.username}
            {isAdmin() && <span className="badge bg-danger ms-1">Admin</span>}
          </span>
          
          {isAdmin() && (
            <Link to="/admin" className="btn btn-outline-info btn-sm me-2">
              จัดการผู้ใช้
            </Link>
          )}
          
          <button 
            className="btn btn-outline-danger btn-sm" 
            onClick={logout}
          >
            ออกจากระบบ
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-primary btn-sm me-2">เข้าสู่ระบบ</Link>
          <Link to="/signup" className="btn btn-outline-primary btn-sm">สมัครสมาชิก</Link>
        </>
      )}
    </div>
  );
};

export default AuthStatus;