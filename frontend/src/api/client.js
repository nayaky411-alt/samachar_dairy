import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.samachardiary24x7.in/api/v1';

export const getStorageUrl = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return '';
  const trimmed = filePath.trim();
  if (!trimmed) return '';

  const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

  // If full HTTP/HTTPS URL
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const urlObj = new URL(trimmed);
      const isLocalHost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
      const isOurDomain = isLocalHost ||
        urlObj.hostname === 'api.samachardiary24x7.in' ||
        urlObj.hostname === 'samachardiary24x7.in' ||
        urlObj.hostname === 'samachar-dairy.vercel.app';

      if (isOurDomain) {
        // When path is news/{filename} or contains news/{filename}
        const newsMatch = urlObj.pathname.match(/\/news\/([^\s?#]+)$/i);
        if (newsMatch) {
          return `${baseUrl}/storage/news/${newsMatch[1]}${urlObj.search}${urlObj.hash}`;
        }
        // When path has /storage/{path}
        const storageMatch = urlObj.pathname.match(/\/storage\/(.+)$/i);
        if (storageMatch) {
          return `${baseUrl}/storage/${storageMatch[1]}${urlObj.search}${urlObj.hash}`;
        }
      } else {
        // Preserve external URLs (http:// and https://) unchanged
        return trimmed;
      }
    } catch {
      // Fallback to string matching below
    }
  }

  // 1. When path is news/{filename} or contains news/{filename}
  const newsMatch = trimmed.match(/(?:^|\/)news\/([^\s?#]+)(.*)$/i);
  if (newsMatch) {
    const filename = newsMatch[1];
    const queryHash = newsMatch[2] || '';
    return `${baseUrl}/storage/news/${filename}${queryHash}`;
  }

  // 2. Preserve external URLs (http:// and https://) unchanged
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 3. Clean relative storage paths
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  if (cleanPath.startsWith('storage/')) {
    return `${baseUrl}/${cleanPath}`;
  }

  return `${baseUrl}/storage/${cleanPath}`;
};

export const getMediaUrl = getStorageUrl;

// Recursively normalize media/image URLs in API responses
const normalizeMediaUrls = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = normalizeMediaUrls(data[i]);
    }
    return data;
  }
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (typeof val === 'string' && val) {
      if (
        key === 'featured_image' ||
        key === 'og_image' ||
        key === 'thumbnail_url' ||
        key === 'cover_image'
      ) {
        data[key] = getStorageUrl(val);
      }
    } else if (val && typeof val === 'object') {
      data[key] = normalizeMediaUrls(val);
    }
  }
  return data;
};

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
  (response) => {
    if (response.data) {
      response.data = normalizeMediaUrls(response.data);
    }
    return response;
  },
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
