// src/services/api.js
import axios from 'axios';

// อ่านค่า BASE URL จาก ENV (ฝังตอน build)
// - บน Render ให้ตั้ง REACT_APP_API_URL = https://license-plate-system.onrender.com
// - ตอน dev ให้สร้าง .env.development ใส่ REACT_APP_API_URL=http://localhost:8000
const API_URL =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

// instance หลักสำหรับเรียก API ปกติ
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// instance แยกไว้ refresh โดยเฉพาะ (กัน interceptor ซ้อน/วนลูป)
const refreshClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// แนบ access token ทุกครั้ง
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Refresh token แบบกันชนไม่ให้ยิงซ้ำหลายคำขอพร้อมกัน ----
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (error) {
      reject(error);
    } else {
      if (token) {
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
      }
      resolve(apiClient(originalRequest));
    }
  });
  pendingQueue = [];
};

// ดัก 401 แล้วลอง refresh หนึ่งรอบ
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // ถ้าไม่มี response หรือไม่ใช่ 401 -> โยนต่อ
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // กันไม่ให้ refresh endpoint เองมาดักซ้ำ
    if (originalRequest?.url?.includes('/auth/refresh_token')) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // ถ้ามีการ refresh อยู่แล้ว -> เข้าคิวรอ token ใหม่
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, originalRequest });
      });
    }

    // เริ่มทำ refresh
    isRefreshing = true;
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) throw new Error('No refresh token');

      const refreshRes = await refreshClient.post('/auth/refresh_token', {
        refresh_token,
      });

      const newToken = refreshRes.data?.access_token;
      if (!newToken) throw new Error('No access_token from refresh');

      localStorage.setItem('token', newToken);

      // เคลียร์คิวที่รออยู่ พร้อมแนบ token ใหม่
      processQueue(null, newToken);

      // ยิงคำขอเดิมซ้ำด้วย token ใหม่
      originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (err) {
      // refresh ล้มเหลว -> ล้างแล้วไปหน้า login
      processQueue(err, null);
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ----------------- Services -----------------
export const plateService = {
  // ดึงป้ายที่ verify แล้วทั้งหมด (sort ก่อน slice)
  getLatestPlates: async (limit = 500) => {
    const res = await apiClient.get('/plates/get_plates');
    const arr = Array.isArray(res.data) ? res.data : [res.data];
    arr.sort((a, b) => {
      const ta = new Date(a.timestamp || a.created_at).getTime();
      const tb = new Date(b.timestamp || b.created_at).getTime();
      return tb - ta;
    });
    return arr.slice(0, limit);
  },

  // ค้นหา
  searchPlates: async (params) => {
    const q = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== '') q.append(k, v);
    });
    const res = await apiClient.get(`/plates/search?${q.toString()}`);
    return res.data;
  },

  // เพิ่ม plate candidate
  addPlate: async (plateNumber, province, id_camera, camera_name) => {
    const payload = { plate_number: plateNumber, province, id_camera, camera_name };
    const res = await apiClient.post('/plates/add_plate', payload);
    return res.data;
  },

  // กล้อง/watchlist/alerts
  getCameras: async () => (await apiClient.get('/plates/get_cameras')).data,
  getWatchlists: async () => (await apiClient.get('/plates/get_watchlists')).data,
  getAlerts: async (status = '') =>
    (await apiClient.get(status ? `/plates/get_alerts?status=${status}` : '/plates/get_alerts')).data,

  // Health
  checkHealth: async () => (await apiClient.get('/health')).data,

  // รายชื่อจังหวัด
  getProvinces: async () => {
    const res = await apiClient.get('/plates/get_plates');
    return Array.from(new Set((res.data || []).map((p) => p.province).filter(Boolean)));
  },

  // Candidates
  getCandidates: async () => (await apiClient.get('/plates/candidates')).data,
  verifyPlate: async (candidateId) =>
    (await apiClient.post(`/plates/verify_plate/${candidateId}`, null)).data,
  rejectCandidate: async (candidateId) =>
    (await apiClient.delete(`/plates/candidates/${candidateId}`)).data,

  // ลบป้าย (admin)
  deletePlate: async (plateId) =>
    (await apiClient.delete(`/plates/delete_plate/${plateId}`)).data,
};

export default plateService;
