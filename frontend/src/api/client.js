import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30s default for regular API calls
});

// Attach Sanctum Bearer token from sessionStorage (isolated per tab) or localStorage
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('samachar_token') || localStorage.getItem('samachar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // File uploads (FormData) should never be prematurely aborted by a short client timeout
  if (config.data instanceof FormData && config.timeout === 30000) {
    config.timeout = 0; // 0 = no timeout (waits for full upload to complete)
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercept 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname.startsWith('/admin')) {
        sessionStorage.removeItem('samachar_token');
        sessionStorage.removeItem('samachar_user');
        localStorage.removeItem('samachar_token');
        localStorage.removeItem('samachar_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
