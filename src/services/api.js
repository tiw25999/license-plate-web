import axios from 'axios';

// เปลี่ยน URL ให้ตรงกับ backend ใหม่
const API_URL = 'https://license-plate-system-production.up.railway.app/';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// เพิ่ม interceptor สำหรับแนบ token ไปกับทุก request
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

// ปรับ endpoint ให้ตรงกับ backend ใหม่
export const plateService = {
  // ดึงรายการทะเบียนล่าสุด
  getLatestPlates: async (limit = 500) => {
    try {
      const response = await apiClient.get('/plates/get_plates');
      return response.data.slice(0, limit);
    } catch (error) {
      console.error('Error fetching plates:', error);
      throw error;
    }
  },

  // ค้นหาทะเบียน
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
      
      // แก้ไขชื่อพารามิเตอร์ให้ตรงกับ backend ใหม่
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (startDate) queryParams.append('start_date', startDate);
      if (endDate) queryParams.append('end_date', endDate);
      if (startMonth) queryParams.append('start_month', startMonth);
      if (endMonth) queryParams.append('end_month', endMonth);
      if (startYear) queryParams.append('start_year', startYear);
      if (endYear) queryParams.append('end_year', endYear);
      if (startHour) queryParams.append('start_hour', startHour);
      if (endHour) queryParams.append('end_hour', endHour);
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
  
  // เพิ่มทะเบียนใหม่
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

  // ดึงรายการ watchlist
  getWatchlists: async () => {
    try {
      const response = await apiClient.get('/plates/get_watchlists');
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      throw error;
    }
  },

  // ดึงรายการแจ้งเตือน
  getAlerts: async (status = null) => {
    try {
      let url = '/plates/get_alerts';
      if (status) {
        url += `?status=${status}`;
      }
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching alerts:', error);
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