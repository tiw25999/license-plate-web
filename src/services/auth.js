import axios from 'axios';

// URL เดียวกับที่ใช้ใน api.js
const API_URL = 'http://localhost:8000';

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
      
      // เพิ่มการเก็บวันหมดอายุ (30 วันนับจากวันนี้)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem('tokenExpiry', expiryDate.toISOString());
      
      return response.data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error.response?.data?.detail || error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
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
      
      // เพิ่มการเก็บวันหมดอายุ (30 วันนับจากวันนี้)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem('tokenExpiry', expiryDate.toISOString());
      
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error.response?.data?.detail || error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
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
      localStorage.removeItem('tokenExpiry');
    }
  },
  
  // ตรวจสอบว่า token หมดอายุหรือยัง
  isTokenExpired: () => {
    const expiryStr = localStorage.getItem('tokenExpiry');
    if (!expiryStr) return true;
    
    const expiry = new Date(expiryStr);
    const now = new Date();
    
    return now > expiry;
  },
  
  // ตรวจสอบสถานะการเข้าสู่ระบบ
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // ตรวจสอบว่า token หมดอายุหรือยัง
    if (authService.isTokenExpired()) {
      // ถ้าหมดอายุ ให้ล้างข้อมูลแล้ว return false
      authService.logout();
      return false;
    }
    
    return true;
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },
  
  // ดึงรายชื่อผู้ใช้ทั้งหมด
  fetchAllUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      console.log('Fetching users with token:', token);
      
      const response = await authClient.get('/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Users response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error.response?.data?.detail || error.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้';
    }
  },
  
  // อัพเดท role ของผู้ใช้
  updateUserRole: async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      console.log('Starting updateUserRole', { userId, role });
      
      // สร้างข้อมูลที่จะส่งไป
      const data = {
        user_id: userId,
        role: role
      };
      
      console.log('Request payload:', data);
      
      const response = await authClient.post('/auth/update-role', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Update role response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error.response?.data?.detail || error.message || 'ไม่สามารถอัพเดทสิทธิ์ผู้ใช้ได้';
    }
  },
  
  // สร้างผู้ใช้ใหม่ (สำหรับ admin)
  createUser: async (username, password, email = null, role = 'member') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      // สร้างข้อมูลที่จะส่งไป
      const data = {
        username,
        password,
        confirm_password: password,
        role
      };
      
      // ใส่ email เฉพาะเมื่อมีค่า
      if (email) {
        data.email = email;
      }
      
      console.log('Creating user with data:', JSON.stringify(data));
      
      const response = await authClient.post('/auth/create-user', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Create user response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response && error.response.status === 404) {
        throw new Error('API endpoint not found. Please check server configuration.');
      }
      throw error.response?.data?.detail || error.message || 'ไม่สามารถสร้างผู้ใช้ได้';
    }
  },
  
  // ลบผู้ใช้ (สำหรับ admin)
  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      console.log('Deleting user with ID:', userId);
      
      const response = await authClient.post('/auth/delete-user', {
        user_id: userId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete user response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error.response?.data?.detail || error.message || 'ไม่สามารถลบผู้ใช้ได้';
    }
  }
};

export default authService;