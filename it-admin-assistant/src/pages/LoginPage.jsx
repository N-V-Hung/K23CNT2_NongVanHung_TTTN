import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(form.username, form.password);
      } else {
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        });
      }
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <Server size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">IT Admin Assistant</h1>
          <p className="text-gray-400 text-sm mt-1">Trợ lý AI quản trị hệ thống CNTT</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-dark-900 p-1 rounded-lg">
            {['login', 'register'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  mode === m
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => update('username', e.target.value)}
                placeholder="admin"
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Họ tên</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="••••••"
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            {mode === 'register' && 'Người dùng đầu tiên sẽ tự động là Admin'}
          </p>
        </div>
      </div>
    </div>
  );
}