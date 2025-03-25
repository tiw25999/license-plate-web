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
  // ดึงรายการทะเบียนล่าสุด (สามารถกำหนดจำนวนที่ต้องการ)
  getLatestPlates: async (limit = 50) => {
    try {
      const response = await apiClient.get('/plates/get_plates');
      // ส่งคืนตามจำนวนที่กำหนด (ค่าเริ่มต้นคือ 50)
      return response.data.slice(0, limit);
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
  },
  
  // ดึงข้อมูลทะเบียนทั้งหมดที่มี (หรือจำกัดตามที่กำหนด)
  getAllPlates: async (limit = 0) => {
    try {
      const response = await apiClient.get('/plates/get_plates');
      // ถ้า limit เป็น 0 หรือค่าลบ จะส่งคืนทั้งหมด
      return limit > 0 ? response.data.slice(0, limit) : response.data;
    } catch (error) {
      console.error('Error fetching all plates:', error);
      throw error;
    }
  }
};