import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

// สร้าง context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          return;
        }
        
        // ถ้ามี token ให้ดึงข้อมูลผู้ใช้จาก localStorage ก่อน
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        try {
          // ตรวจสอบความถูกต้องของ token กับ server
          const userData = await authService.fetchCurrentUser();
          if (userData) {
            setUser(userData);
            // อัปเดตข้อมูลใน localStorage
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Error validating token:", err);
          // ถ้าเกิดข้อผิดพลาด ให้ใช้ข้อมูลจาก localStorage ต่อไป
          // ไม่ต้อง logout ผู้ใช้
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
const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(username, password);
      
      // บันทึก token ลงใน localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      }));
      
      setUser({
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role
      });
      
      return true;
    } catch (err) {
      setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชัน signup
  const signup = async (username, password, confirmPassword, email = null) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signup(username, password, confirmPassword, email);
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