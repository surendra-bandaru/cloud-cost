import axios from 'axios';

const getBaseURL = () => {
  // Use runtime window location to determine API URL
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:4000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
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
    config.baseURL = process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:4000/api`;
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
