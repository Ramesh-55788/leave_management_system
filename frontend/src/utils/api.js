import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Add this response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      return Promise.reject(error); // Don't log 400 errors to console
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const retryRequest = async (request, retries = 3, delay = 1000) => {
  try {
    return await request();
  } catch (error) {
    if (retries === 0) throw error;
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryRequest(request, retries - 1, delay * 2);
  }
};

export const apiPostWithRetry = async (url, data) => {
  return retryRequest(() => api.post(url, data));
};

export default api;