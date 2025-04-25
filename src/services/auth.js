import axios from 'axios';

// URL เดียวกับที่ใช้ใน api.js
const API_URL = 'https://license-plate-system-production.up.railway.app/';

// สร้าง axios instance สำหรับ auth
const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const authService = {
  // สมัครสมาชิกใหม่
  signup: async (username, password, confirmPassword, email = null) => {
    try {
      const response = await authClient.post('/auth/signup', {
        username,
        password,
        confirm_password: confirmPassword,
        email
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
    }
  },
  
  // เข้าสู่ระบบ
  login: async (username, password) => {
    try {
      const response = await authClient.post('/auth/login', {
        username,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    }
  },
  
  // ออกจากระบบ
  logout: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await authClient.post('/auth/logout', { token });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  // ตรวจสอบสถานะการเข้าสู่ระบบ
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // ดึงข้อมูลผู้ใช้ปัจจุบัน
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  // ตรวจสอบว่าผู้ใช้เป็น admin หรือไม่
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  },
  
  // ดึงข้อมูลผู้ใช้ปัจจุบันจาก server
  fetchCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await authClient.get('/auth/me', {
        params: { token }
      });
      
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  // ดึงรายชื่อผู้ใช้ทั้งหมด
  fetchAllUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await authClient.get('/auth/users', {
        params: { token }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
    }
  },
  
  // อัพเดท role ของผู้ใช้
  updateUserRole: async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await authClient.post('/auth/update-role', {
        user_id: userId,
        role
      }, {
        params: { token }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error.message || 'ไม่สามารถอัพเดทสิทธิ์ผู้ใช้ได้';
    }
  }
};

export default authService;