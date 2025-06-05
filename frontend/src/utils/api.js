import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add Authorization header if token is found
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to suppress 400 error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      return Promise.reject(error); // Don't log 400 errors
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
