import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { verifyLogin2FA } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, setUserData } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ===== Bước 2FA =====
  const [step2FA, setStep2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [code, setCode] = useState('');

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Lưu user + token sau khi đăng nhập thành công
  const saveAuth = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUserData(data.user);
  };

  // ===== Đăng nhập bước 1 =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(form.username, form.password);

        // Nếu backend báo cần 2FA → chuyển bước 2
        if (res?.require2FA) {
          setTempToken(res.data.tempToken);
          setStep2FA(true);
          return;
        }
        navigate('/chat');
      } else {
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName,
        });
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  // ===== Đăng nhập bước 2 (2FA) =====
  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await verifyLogin2FA(tempToken, code);
      saveAuth(res.data);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác thực không đúng');
      setCode('');
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
            {step2FA ? <Shield size={32} className="text-white" /> : <Server size={32} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step2FA ? 'Xác thực 2 yếu tố' : 'IT Admin Assistant'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {step2FA
              ? 'Nhập mã 6 số từ Google Authenticator'
              : 'Trợ lý AI quản trị hệ thống CNTT'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-xl">

          {/* ===== BƯỚC 1: Đăng nhập/Đăng ký ===== */}
          {!step2FA && (
            <>
              <div className="flex gap-2 mb-6 bg-dark-900 p-1 rounded-lg">
                {['login', 'register'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setError(''); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                      mode === m ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
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
            </>
          )}

          {/* ===== BƯỚC 2: Nhập mã 2FA ===== */}
          {step2FA && (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
                Mở app <strong>Google Authenticator</strong> và nhập mã 6 số đang hiển thị.
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5 text-center">
                  Mã xác thực
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-3 text-center text-3xl font-mono tracking-widest text-white focus:outline-none focus:border-accent"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={code.length !== 6 || loading}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                Xác nhận
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep2FA(false);
                  setCode('');
                  setTempToken('');
                  setError('');
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-300 transition"
              >
                ← Quay lại đăng nhập
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}