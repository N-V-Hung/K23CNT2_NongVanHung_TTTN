import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user từ localStorage khi mở app
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await api.getMe();
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Token không hợp lệ:', err.message);
          clearStorage();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

const clearStorage = () => {
  // Xóa token + user
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Xóa cache chat trong sessionStorage (tất cả key bắt đầu bằng "chat_session_")
  try {
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('chat_session_')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.error('Lỗi xóa sessionStorage:', err);
  }
};

  const loginUser = async (username, password) => {
  clearStorage();
  const res = await api.login(username, password);

  // Nếu cần 2FA → không lưu token, trả nguyên response cho LoginPage
  if (res.require2FA) {
    return res;
  }

  // Đăng nhập bình thường
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('user', JSON.stringify(res.data.user));
  setUser(res.data.user);
  return res.data.user;
};
  const registerUser = async (data) => {
    clearStorage();
    const res = await api.register(data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    clearStorage();
    setUser(null);
  };

  // Cập nhật user trong context + localStorage
  const setUserData = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login: loginUser,
      register: registerUser,
      logout,
      setUserData,                
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}