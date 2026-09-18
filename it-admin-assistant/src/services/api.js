import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ===== Interceptor: Tự động gắn token vào mọi request =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Interceptor: Xử lý lỗi 401 (token hết hạn) =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Chuyển về trang login nếu chưa ở đó
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTH APIs =====
export async function register(data) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

// ===== CHAT APIs =====
export async function sendChatMessage(message, history = []) {
  const res = await api.post('/chat', {
    message,
    history: history.map(m => ({ role: m.role, content: m.content })),
  });
  return res.data.data; // { content, timestamp }
}

export async function getChatHistory(limit = 50) {
  const res = await api.get(`/chat/history?limit=${limit}`);
  return res.data.data;
}

export async function clearChatHistory() {
  const res = await api.delete('/chat/history');
  return res.data;
}

// ===== USER APIs (admin) =====
export async function listUsers() {
  const res = await api.get('/users');
  return res.data.data;
}

export async function toggleUserActive(userId) {
  const res = await api.patch(`/users/${userId}/toggle-active`);
  return res.data.data;
}

export async function deleteUser(userId) {
  const res = await api.delete(`/users/${userId}`);
  return res.data;
}

export default api;