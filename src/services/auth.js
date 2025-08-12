import axios from 'axios';

const API_URL = 'https://license-plate-system.onrender.com';

const authClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const authService = {
  signup: async (username, password, confirmPassword, email = null) => {
    const response = await authClient.post('/auth/signup', {
      username,
      password,
      confirm_password: confirmPassword,
      email
    });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refresh_token); // ✅
    localStorage.setItem('user', JSON.stringify({
      id: response.data.user_id,
      username: response.data.username,
      role: response.data.role
    }));

    // Set token expiry (optional)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('tokenExpiry', expiryDate.toISOString());

    return response.data;
  },

  login: async (username, password) => {
    const response = await authClient.post('/auth/login', { username, password });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refresh_token); // ✅
    localStorage.setItem('user', JSON.stringify({
      id: response.data.user_id,
      username: response.data.username,
      role: response.data.role
    }));

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    localStorage.setItem('tokenExpiry', expiryDate.toISOString());

    return response.data;
  },

  logout: async () => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (refresh_token) {
        await authClient.post('/auth/logout', { refresh_token });
      }
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      localStorage.clear();
    }
  },

  refreshAccessToken: async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) throw new Error('No refresh token');

    const response = await authClient.post('/auth/refresh_token', { refresh_token });
    localStorage.setItem('token', response.data.access_token);
    return response.data.access_token;
  },

  isTokenExpired: () => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return new Date() > new Date(expiry);
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return token && !authService.isTokenExpired();
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  }
};

export default authService;
