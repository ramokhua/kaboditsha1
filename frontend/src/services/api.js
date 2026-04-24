// frontend/src/services/api.js

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if redirect is in progress
let isRedirecting = false;

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only log in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, token ? '✅ Token present' : '❌ No token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    // Log error in development
    if (import.meta.env.DEV && config) {
      console.error(`[API Error] ${config.url} - ${response?.status}`, response?.data);
    }
    
    // Handle 401 Unauthorized
    if (response?.status === 401) {
      // Don't redirect for public routes
      const publicPaths = ['/auth/login', '/auth/register', '/health', '/landboards', '/statistics'];
      const isPublicPath = publicPaths.some(path => config?.url?.includes(path));
      
      if (!isPublicPath && !isRedirecting) {
        console.log('401 Unauthorized - Clearing token and redirecting to login');
        isRedirecting = true;
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        setTimeout(() => {
          isRedirecting = false;
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;