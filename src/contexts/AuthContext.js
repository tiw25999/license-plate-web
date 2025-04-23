import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

// สร้าง context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อโหลดแอป
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // ตรวจสอบว่ามี token และข้อมูลผู้ใช้ใน localStorage หรือไม่
        if (authService.isAuthenticated()) {
          const userData = authService.getCurrentUser();
          
          if (userData) {
            // ตรวจสอบความถูกต้องของ token กับ server
            try {
              await authService.fetchCurrentUser();
              setUser(authService.getCurrentUser());
            } catch (err) {
              // ถ้า token ไม่ถูกต้อง ให้ logout
              authService.logout();
              setUser(null);
              setError('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // ฟังก์ชัน login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.login(email, password);
      setUser(authService.getCurrentUser());
      
      return true;
    } catch (err) {
      setError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน signup
  const signup = async (email, password, confirmPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signup(email, password, confirmPassword);
      setUser(authService.getCurrentUser());
      
      return true;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน logout
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันตรวจสอบว่าเป็น admin หรือไม่
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // ฟังก์ชันตรวจสอบสิทธิ์
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }
    
    if (requiredRole === 'member') {
      return user.role === 'admin' || user.role === 'member';
    }
    
    return true;
  };

  // ค่าที่ส่งไปยัง context
  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAdmin,
    hasPermission,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook สำหรับการใช้งาน context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};