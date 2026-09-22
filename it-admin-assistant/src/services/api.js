import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// ===== Interceptor: Tự động gắn token =====
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

// ===== Interceptor: Xử lý 401 =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// ===== AUTH =====
// ============================================================
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

export async function verifyLogin2FA(tempToken, code) {
  const res = await api.post('/auth/verify-2fa', { tempToken, code });
  return res.data;
}

// ============================================================
// ===== CHAT =====
// ============================================================
export async function sendChatMessage(message, history = []) {
  const res = await api.post('/chat', {
    message,
    history: history.map(m => ({ role: m.role, content: m.content })),
  });
  return res.data.data;
}

export async function getChatHistory(limit = 50) {
  const res = await api.get(`/chat/history?limit=${limit}`);
  return res.data.data;
}

export async function clearChatHistory() {
  const res = await api.delete('/chat/history');
  return res.data;
}

// ============================================================
// ===== USERS (admin) =====
// ============================================================
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

// ============================================================
// ===== PROFILE =====
// ============================================================
export async function updateProfile(data) {
  const res = await api.put('/profile', data);
  return res.data;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await api.put('/profile/password', { currentPassword, newPassword });
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteAvatar() {
  const res = await api.delete('/profile/avatar');
  return res.data;
}

export function getAvatarUrl(avatarPath) {
  if (!avatarPath) return '';
  const base = API_URL.replace('/api', '');
  return `${base}${avatarPath}`;
}

// ============================================================
// ===== 2FA =====
// ============================================================
export async function get2FAStatus() {
  const res = await api.get('/2fa/status');
  return res.data.data;
}

export async function setup2FA() {
  const res = await api.post('/2fa/setup');
  return res.data.data;
}

export async function verify2FA(token) {
  const res = await api.post('/2fa/verify', { token });
  return res.data;
}

export async function disable2FA(password) {
  const res = await api.post('/2fa/disable', { password });
  return res.data;
}

// ============================================================
// ===== SERVERS (MongoDB) =====
// ============================================================
export async function getSystemStats() {
  const res = await api.get('/servers/system');
  return res.data.data;
}

export async function getServers(filter = {}) {
  const params = new URLSearchParams(filter).toString();
  const res = await api.get(`/servers${params ? '?' + params : ''}`);
  return res.data.data;
}

export async function getServerCounts() {
  const res = await api.get('/servers/count');
  return res.data.data;
}

export async function createServer(data) {
  const res = await api.post('/servers', data);
  return res.data;
}

export async function updateServer(id, data) {
  const res = await api.put(`/servers/${id}`, data);
  return res.data;
}

export async function deleteServer(id) {
  const res = await api.delete(`/servers/${id}`);
  return res.data;
}

export async function restartServer(id) {
  const res = await api.post(`/servers/${id}/restart`);
  return res.data;
}

export default api;