import axios from 'axios';

const API_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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

// ✅ Interceptor สำหรับ refresh token เมื่อเจอ 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refresh_token = localStorage.getItem('refresh_token');
        if (!refresh_token) throw new Error('No refresh token');

        const res = await apiClient.post('/auth/refresh_token', { refresh_token });
        const newToken = res.data.access_token;
        localStorage.setItem('token', newToken);

        error.config.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(error.config);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const plateService = {
  getLatestPlates: async (limit = 500) => {
    const response = await apiClient.get('/plates/get_plates');
    return response.data.slice(0, limit);
  },

  searchPlates: async (params) => {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    }
    const response = await apiClient.get(`/plates/search?${queryParams}`);
    return response.data;
  },

  addPlate: async (plateNumber, province, id_camera, camera_name) => {
    const response = await apiClient.post('/plates/add_plate', null, {
      params: { plate_number: plateNumber, province, id_camera, camera_name }
    });
    return response.data;
  },

  getCameras: async () => {
    const response = await apiClient.get('/plates/get_cameras');
    return response.data;
  },

  getWatchlists: async () => {
    const response = await apiClient.get('/plates/get_watchlists');
    return response.data;
  },

  getAlerts: async (status = null) => {
    const url = status ? `/plates/get_alerts?status=${status}` : '/plates/get_alerts';
    const response = await apiClient.get(url);
    return response.data;
  },

  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  getProvinces: async () => {
    const response = await apiClient.get('/plates/get_plates');
    const provinces = [...new Set(
      response.data.map(p => p.province).filter(p => p)
    )];
    return provinces;
  },

  // ✅ เพิ่ม: ใช้กับ VerifyPlateManager
  getCandidates: async () => {
    const response = await apiClient.get('/plates/candidates');
    return response.data;
  },

  verifyPlate: async (candidateId) => {
    const response = await apiClient.post(`/plates/verify_plate/${candidateId}`);
    return response.data;
  },

  deletePlate: async (plateId) => {
    const response = await apiClient.delete(`/plates/delete_plate/${plateId}`);
    return response.data;
  },

  rejectCandidate: async (candidateId) => {
    const response = await apiClient.delete(`/plates/candidates/${candidateId}`);
    return response.data;
  },
  
};

export default plateService;
