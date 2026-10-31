import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const userStorage = localStorage.getItem('userInfo');
    if (userStorage) {
      const userInfo = JSON.parse(userStorage);
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor for handling 401 unauth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear user session
      const userStorage = localStorage.getItem('userInfo');
      if (userStorage) {
        localStorage.removeItem('userInfo');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
