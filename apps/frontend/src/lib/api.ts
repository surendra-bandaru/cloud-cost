import axios from 'axios';

const getBaseURL = () => {
  // Check for runtime environment variable (set by Kubernetes)
  if (typeof window !== 'undefined') {
    // Try to get from window object (injected at runtime)
    const apiUrl = (window as any).__NEXT_PUBLIC_API_URL__;
    if (apiUrl) return apiUrl;
  }
  
  // Fallback to build-time env var
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Final fallback to backend LoadBalancer IP
  return 'http://13.71.54.206:4000/api';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-redirect to login for 401 if it's not from settings page
    if (error.response?.status === 401) {
      // Don't auto-redirect, let the component handle it
      console.error('Authentication error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);
