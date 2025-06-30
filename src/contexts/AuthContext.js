import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (!token && !refreshToken) {
          setUser(null);
          return;
        }

        if (authService.isTokenExpired() && refreshToken) {
          try {
            await authService.refreshAccessToken();
          } catch (err) {
            console.warn('Token refresh failed:', err);
            await authService.logout();
            setUser(null);
            return;
          }
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        try {
          const userData = await authService.fetchCurrentUser?.();
          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (e) {
          console.warn('Failed to verify token:', e);
        }
      } catch (err) {
        setError(err.message || 'Auth error');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password, remember = true) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(username, password);
      const userData = {
        id: response.user_id,
        username: response.username,
        role: response.role
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (remember ? 7 : 1));
      localStorage.setItem('tokenExpiry', expiryDate.toISOString());

      return userData; // ✅ คืน userData ให้ LoginPage ใช้
    } catch (err) {
      setError(err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, password, confirmPassword, email = null) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signup(username, password, confirmPassword, email);
      const userData = authService.getCurrentUser();
      setUser(userData);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      localStorage.setItem('tokenExpiry', expiryDate.toISOString());

      return true;
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      return false;
    } finally {
      setLoading(false);
    }
  };

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

  const isAdmin = () => user && user.role === 'admin';

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    if (requiredRole === 'admin') return user.role === 'admin';
    if (requiredRole === 'member') return ['admin', 'member'].includes(user.role);
    return true;
  };

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
