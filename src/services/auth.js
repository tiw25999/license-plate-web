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

// เพิ่ม interceptor สำหรับจัดการความผิดพลาด
authClient.interceptors.response.use(
  response => response,
  error => {
    console.error('Auth API Error:', error);
    
    if (error.response && error.response.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject({ 
        ...error, 
        message: 'กรุณาเข้าสู่ระบบใหม่' 
      });
    }
    
    return Promise.reject({ 
      ...error, 
      message: error.response?.data?.detail || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ' 
    });
  }
);

// ฟังก์ชันสำหรับการเรียกใช้ API
export const authService = {
  // สมัครสมาชิกใหม่
  signup: async (email, password, confirmPassword) => {
    try {
      const response = await authClient.post('/auth/signup', {
        email,
        password,
        confirm_password: confirmPassword
      });
      
      // เก็บข้อมูลผู้ใช้และ token ใน localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
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
  login: async (email, password) => {
    try {
      const response = await authClient.post('/auth/login', {
        email,
        password
      });
      
      // เก็บข้อมูลผู้ใช้และ token ใน localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        role: response.data.role
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
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
      // ลบข้อมูลผู้ใช้และ token ออกจาก localStorage
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
  
  // ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการทำงานหรือไม่
  hasPermission: (requiredRole) => {
    const user = authService.getCurrentUser();
    
    if (!user) return false;
    
    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }
    
    if (requiredRole === 'member') {
      return user.role === 'admin' || user.role === 'member';
    }
    
    return true;
  },
  
  // ดึงข้อมูลผู้ใช้ปัจจุบันจาก server (เพื่อตรวจสอบความถูกต้องของ token)
  fetchCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await authClient.get('/auth/me', {
        params: { token }
      });
      
      // อัพเดทข้อมูลผู้ใช้ใน localStorage
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // ถ้าเกิด error ให้ logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  // ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับ admin เท่านั้น)
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
  
  // อัพเดท role ของผู้ใช้ (สำหรับ admin เท่านั้น)
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
  },
  
  // เปลี่ยนรหัสผ่าน
  changePassword: async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await authClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      }, {
        params: { token }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
    }
  }
};

export default authService;