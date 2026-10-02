import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('shopsphere_user');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Error parsing stored user token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear local storage
      const currentUrl = window.location.pathname;
      if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
        localStorage.removeItem('shopsphere_user');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
