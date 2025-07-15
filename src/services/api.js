import axios from 'axios';

const API_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor แนบ token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor สำหรับ refresh token เมื่อเจอ 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) throw new Error('No refresh token');

        // เรียก refresh_token endpoint
        const refreshRes = await apiClient.post('/auth/refresh_token', { refresh_token });
        const newToken = refreshRes.data.access_token;
        localStorage.setItem('token', newToken);

        // retry request เก่าด้วย token ใหม่
        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(error.config);
      } catch (err) {
        // ถ้า refresh ล้มเหลว ให้ล้าง storage และพาไปหน้า login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const plateService = {
  // ดึงป้ายที่ verify แล้วทั้งหมด (sort ก่อน slice)
  getLatestPlates: async (limit = 500) => {
    const res = await apiClient.get('/plates/get_plates');
    const arr = Array.isArray(res.data) ? res.data : [res.data];
    // เรียง by timestamp ใหม่สุดก่อน
    arr.sort((a, b) => {
      const ta = new Date(a.timestamp || a.created_at).getTime();
      const tb = new Date(b.timestamp || b.created_at).getTime();
      return tb - ta;
    });
    return arr.slice(0, limit);
  },

  // ค้นหาป้ายที่ verify แล้ว ตามเงื่อนไข
  searchPlates: async (params) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        q.append(key, val);
      }
    });
    const res = await apiClient.get(`/plates/search?${q.toString()}`);
    return res.data;
  },

  // เพิ่ม plate candidate
  addPlate: async (plateNumber, province, id_camera, camera_name) => {
    const payload = {
      plate_number: plateNumber,
      province,
      id_camera,
      camera_name
    };
    const res = await apiClient.post('/plates/add_plate', payload);
    return res.data;
  },

  // ดึงกล้อง
  getCameras: async () => {
    const res = await apiClient.get('/plates/get_cameras');
    return res.data;
  },

  // ดึง watchlists
  getWatchlists: async () => {
    const res = await apiClient.get('/plates/get_watchlists');
    return res.data;
  },

  // ดึง alerts
  getAlerts: async (status = '') => {
    const url = status ? `/plates/get_alerts?status=${status}` : '/plates/get_alerts';
    const res = await apiClient.get(url);
    return res.data;
  },

  // ตรวจสอบสุขภาพ API
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // ดึงรายชื่อจังหวัดจากป้ายที่ verify แล้ว
  getProvinces: async () => {
    const res = await apiClient.get('/plates/get_plates');
    const provinces = Array.from(
      new Set(res.data.map(p => p.province).filter(p => p))
    );
    return provinces;
  },

  // ดึง candidates รอ verify
  getCandidates: async () => {
    const res = await apiClient.get('/plates/candidates');
    return res.data;
  },

  // verify candidate
  verifyPlate: async (candidateId) => {
    const res = await apiClient.post(`/plates/verify_plate/${candidateId}`, null);
    return res.data;
  },

  // reject candidate
  rejectCandidate: async (candidateId) => {
    const res = await apiClient.delete(`/plates/candidates/${candidateId}`);
    return res.data;
  },

  // **ลบป้ายที่ verify แล้ว** (admin)
  deletePlate: async (plateId) => {
    const res = await apiClient.delete(`/plates/delete_plate/${plateId}`);
    return res.data;
  },
};

export default plateService;
