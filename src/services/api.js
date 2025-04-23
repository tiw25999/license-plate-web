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

// เพิ่ม interceptor สำหรับแนบ token ไปกับทุก request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// เพิ่ม interceptor สำหรับจัดการความผิดพลาด
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // ถ้ามี response กลับมา แสดงว่าเป็น HTTP error
    if (error.response) {
      if (error.response.status === 401) {
        // Token หมดอายุหรือไม่ถูกต้อง
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject({ 
          ...error, 
          message: 'กรุณาเข้าสู่ระบบใหม่' 
        });
      }
      
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

  // ค้นหาทะเบียนตามเลขทะเบียนแบบเฉพาะเจาะจง
  searchPlateExact: async (plateNumber) => {
    try {
      const response = await apiClient.get(`/plates/get_plates?plate_number=${plateNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error searching plate:', error);
      throw error;
    }
  },

  // ค้นหาทะเบียนแบบละเอียด
  searchPlates: async (params) => {
    try {
      const { 
        searchTerm, 
        startDate, 
        endDate, 
        startMonth, 
        endMonth, 
        startYear, 
        endYear,
        startHour,
        endHour,
        province,
        id_camera,
        camera_name,
        limit = 500 
      } = params;
      
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search_term', searchTerm);
      
      // วันที่
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);
      
      // เดือน/ปี
      if (startMonth) queryParams.append('start_month', startMonth);
      if (endMonth) queryParams.append('end_month', endMonth);
      if (startYear) queryParams.append('start_year', startYear);
      if (endYear) queryParams.append('end_year', endYear);
      
      // เวลา
      if (startHour) queryParams.append('start_hour', startHour);
      if (endHour) queryParams.append('end_hour', endHour);
      
      // ข้อมูลเพิ่มเติม
      if (province) queryParams.append('province', province);
      if (id_camera) queryParams.append('id_camera', id_camera);
      if (camera_name) queryParams.append('camera_name', camera_name);
      
      if (limit) queryParams.append('limit', limit);
      
      const response = await apiClient.get(`/plates/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching plates:', error);
      throw error;
    }
  },
  
  // เพิ่มทะเบียนใหม่ (ต้อง login ก่อน)
  addPlate: async (plateNumber, province, id_camera, camera_name) => {
    try {
      const response = await apiClient.post('/plates/add_plate', null, {
        params: {
          plate_number: plateNumber,
          province,
          id_camera,
          camera_name
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding plate:', error);
      throw error;
    }
  },
  
  // ลบทะเบียน (เฉพาะ admin)
  deletePlate: async (plateId) => {
    try {
      const response = await apiClient.delete(`/plates/delete_plate/${plateId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting plate:', error);
      throw error;
    }
  },
  
  // ดึงรายชื่อจังหวัดทั้งหมด
  getProvinces: async () => {
    try {
      const response = await apiClient.get('/plates/get_provinces');
      return response.data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },
  
  // ดึงรายการกล้องทั้งหมด
  getCameras: async () => {
    try {
      const response = await apiClient.get('/plates/get_cameras');
      return response.data;
    } catch (error) {
      console.error('Error fetching cameras:', error);
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

export default plateService;