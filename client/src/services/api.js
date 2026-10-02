import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error extraction
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized received, token might have expired
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/admin/login')
      ) {
        localStorage.removeItem('eventhub_token');
        localStorage.removeItem('eventhub_user');
      }
    }
    return Promise.reject(error);
  }
);

export default API;
