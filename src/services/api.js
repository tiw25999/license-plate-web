import axios from 'axios';

// เปลี่ยน URL นี้เป็น URL ของ API บน Railway ของคุณ
const API_URL = 'https://license-plate-system-production.up.railway.app/';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // เพิ่ม timeout เพื่อป้องกันการค้าง
  timeout: 10000,
});

// เพิ่ม interceptor สำหรับจัดการความผิดพลาด
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    // ถ้ามี response กลับมา แสดงว่าเป็น HTTP error
    if (error.response) {
      if (error.response.status === 404) {
        return Promise.reject({ 
          ...error, 
          message: 'ไม่พบข้อมูลที่ค้นหา' 
        });
      }
      return Promise.reject({ 
        ...error, 
        message: `เกิดข้อผิดพลาด: ${error.response.status} ${error.response.statusText}` 
      });
    }
    // ถ้าเป็น network error หรือ timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ 
        ...error, 
        message: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง' 
      });
    }
    return Promise.reject(error);
  }
);

// ฟังก์ชันสำหรับการเรียกใช้ API
export const plateService = {
  // ดึงรายการทะเบียนล่าสุด (สามารถกำหนดจำนวนที่ต้องการ)
  getLatestPlates: async (limit = 500) => {
    try {
      const response = await apiClient.get('/plates/get_plates');
      return response.data.slice(0, limit);
    } catch (error) {
      console.error('Error fetching plates:', error);
      throw error;
    }
  },

  // ค้นหาทะเบียนตามเลขทะเบียน (ใช้ endpoint เดิม)
  searchPlateExact: async (plateNumber) => {
    try {
      const response = await apiClient.get(`/plates/get_plates?plate_number=${plateNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error searching plate:', error);
      throw error;
    }
  },

  // ค้นหาทะเบียนแบบคลุมเครือ (ใช้ endpoint ใหม่)
  searchPlates: async (params) => {
    try {
      const { searchTerm, startDate, endDate, limit = 500 } = params;
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);
      if (limit) queryParams.append('limit', limit);
      
      const response = await apiClient.get(`/plates/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching plates:', error);
      throw error;
    }
  },

  // ตรวจสอบสถานะ API
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('API health check failed:', error);
      throw error;
    }
  }
};