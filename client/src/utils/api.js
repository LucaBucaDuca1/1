import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, email, password, displayName) =>
    api.post('/auth/register', { username, email, password, displayName }),
  getMe: () => api.get('/auth/me'),
};

// Media APIs
export const mediaAPI = {
  getAll: (params) => api.get('/media', { params }),
  getById: (id) => api.get(`/media/${id}`),
  getFeatured: () => api.get('/featured'),
  getGenres: () => api.get('/genres'),
  getRecommendations: (id) => api.get(`/recommendations/${id}`),
  add: (data) => api.post('/media', data),
};

// Watch History APIs
export const watchHistoryAPI = {
  get: () => api.get('/watch-history'),
  update: (mediaId, episodeId, progress, duration) =>
    api.post('/watch-history', { mediaId, episodeId, progress, duration }),
  getProgress: (mediaId, episodeId) => {
    const params = episodeId ? { episodeId } : {};
    return api.get(`/watch-history/${mediaId}`, { params });
  },
};

// My List APIs
export const myListAPI = {
  get: () => api.get('/my-list'),
  add: (mediaId) => api.post(`/my-list/${mediaId}`),
  remove: (mediaId) => api.delete(`/my-list/${mediaId}`),
  check: (mediaId) => api.get(`/my-list/check/${mediaId}`),
};

// Preferences APIs
export const preferencesAPI = {
  get: () => api.get('/preferences'),
  update: (data) => api.put('/preferences', data),
};

// Profile APIs
export const profileAPI = {
  update: (data) => api.put('/profile', data),
  getStats: () => api.get('/stats'),
};

export default api;
