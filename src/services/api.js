import axios from 'axios';

// เปลี่ยน URL นี้เป็น URL ของ API บน Railway ของคุณ
const API_URL = 'https://license-plate-system-production.up.railway.app/';

// สร้าง axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ฟังก์ชันสำหรับการเรียกใช้ API
export const plateService = {
  // ดึงรายการทะเบียนล่าสุด (50 รายการ)
  getLatestPlates: async () => {
    try {
      const response = await apiClient.get('/plates/get_plates');
      // ส่งคืนเฉพาะ 50 รายการล่าสุด
      return response.data.slice(0, 50);
    } catch (error) {
      console.error('Error fetching plates:', error);
      throw error;
    }
  },

  // ค้นหาทะเบียนตามเลขทะเบียน
  searchPlate: async (plateNumber) => {
    try {
      const response = await apiClient.get(`/plates/get_plates?plate_number=${plateNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error searching plate:', error);
      throw error;
    }
  }
};