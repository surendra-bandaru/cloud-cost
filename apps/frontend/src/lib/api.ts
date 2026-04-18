import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Use same host but port 4000 for backend
    const host = window.location.hostname;
    return `http://${host}:4000/api`;
  }
  return 'http://localhost:4000/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL on each request to handle dynamic hostname
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    config.baseURL = `http://${host}:4000/api`;
  }
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
