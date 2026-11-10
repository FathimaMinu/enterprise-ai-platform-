import axios from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Request interceptor: attach JWT ─────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eai_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ───────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eai_token');
      // Redirect to login only if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Helper: extract error message ───────────────────────────────────────────
export const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || 'An unexpected error occurred';
  if (data.fieldErrors) {
    return Object.values(data.fieldErrors).join(', ');
  }
  return data.message || 'An unexpected error occurred';
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (credentials) => API.post('/auth/login',    credentials),
  register: (userData)    => API.post('/auth/register', userData),
};

// ─── Profile API ──────────────────────────────────────────────────────────────
export const profileAPI = {
  get:            ()       => API.get('/profile'),
  update:         (data)   => API.put('/profile', data),
  changePassword: (data)   => API.post('/profile/change-password', data),
  uploadAvatar:   (formData) => API.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

// ─── Knowledge Base API ───────────────────────────────────────────────────────
export const knowledgeBaseAPI = {
  list:   (params) => API.get('/knowledge-base', { params }),
  getById:(id)     => API.get(`/knowledge-base/${id}`),
  create: (data)   => API.post('/knowledge-base', data),
  update: (id, data) => API.put(`/knowledge-base/${id}`, data),
  delete: (id)     => API.delete(`/knowledge-base/${id}`),
};

// ─── Documents API ────────────────────────────────────────────────────────────
export const documentAPI = {
  list:   ()         => API.get('/documents'),
  getById:(id)       => API.get(`/documents/${id}`),
  upload: (formData) => API.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id)       => API.delete(`/documents/${id}`),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatAPI = {
  getMessages:   ()        => API.get('/chat/messages'),
  sendMessage:   (data)    => API.post('/chat/message', data),
  deleteMessage: (id)      => API.delete(`/chat/${id}`),
};

// ─── Analytics API ────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getStats:       ()       => API.get('/analytics/stats'),
  getQueries:     (range)  => API.get('/analytics/queries', { params: { range } }),
  getDepartments: ()       => API.get('/analytics/departments'),
};

// ─── Settings API ─────────────────────────────────────────────────────────────
export const settingsAPI = {
  get:    ()     => API.get('/settings'),
  update: (data) => API.put('/settings', data),
};

export default API;
