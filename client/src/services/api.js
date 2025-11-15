import axios from 'axios';

// Create axios instance with base URL from environment variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear localStorage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

// User API
export const getCurrentUser = () => api.get('/auth/me');
export const updateProfile = (userData) => api.put('/auth/profile', userData);

// Food API
export const foodAPI = {
  create: (foodData) => api.post('/food', foodData),
  getAll: () => api.get('/food'),
  getByDate: (date) => api.get(`/food/${date}`),
};

// Workout API
export const workoutAPI = {
  create: (workoutData) => api.post('/workouts', workoutData),
  getAll: () => api.get('/workouts'),
  getByDate: (date) => api.get(`/workouts/${date}`),
};

// Summary API
export const summaryAPI = {
  getToday: () => api.get('/summary/today'),
};

// Nutrition API
export const nutritionAPI = {
  searchFood: (foodName, quantity) => api.post('/nutrition/search', { foodName, quantity }),
  calculateWorkout: (workoutType, duration) => 
    api.post('/nutrition/calculate-workout', { workoutType, duration }),
};

// Health API
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
