import { useState, useRef } from 'react';
import {
  User as UserIcon, Mail, Lock, Camera, Trash2, Save, Loader2, Check, AlertCircle,
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile, changePassword, uploadAvatar, deleteAvatar, getAvatarUrl,
} from '../services/api';
import TwoFactorSection from '../components/TwoFactorSection';

export default function ProfilePage() {
  const { user, setUserData } = useAuth();
  const fileRef = useRef(null);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [pwdForm, setPwdForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);

  // ===== Cập nhật profile =====
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setLoadingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      setUserData(res.data.user);
      setProfileMsg({ type: 'success', text: res.message || 'Đã cập nhật thông tin' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Có lỗi xảy ra',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // ===== Đổi mật khẩu =====
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới tối thiểu 6 ký tự' });
      return;
    }

    setLoadingPwd(true);
    try {
      const res = await changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      setPwdMsg({ type: 'success', text: res.message || 'Đã đổi mật khẩu thành công' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Có lỗi xảy ra',
      });
    } finally {
      setLoadingPwd(false);
    }
  };

  // ===== Upload avatar =====
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ảnh tối đa 5MB');
      return;
    }

    setLoadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      setUserData(res.data.user);
    } catch (err) {
      alert('Lỗi upload: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ===== Xóa avatar =====
  const handleDeleteAvatar = async () => {
    if (!confirm('Xóa avatar hiện tại?')) return;
    setLoadingAvatar(true);
    try {
      const res = await deleteAvatar();
      setUserData(res.data.user);
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingAvatar(false);
    }
  };

  const avatarUrl = getAvatarUrl(user?.avatar);

  return (
    <>
      <Header title="Tài khoản cá nhân" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* ===== Avatar + Username ===== */}
          <section className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden border-4 border-dark-700">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-white" />
                  )}
                </div>
                {loadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  {user?.fullName || user?.username}
                </h2>
                <p className="text-sm text-gray-400 mb-3">@{user?.username}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={loadingAvatar}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm transition"
                  >
                    <Camera size={14} />
                    Đổi ảnh
                  </button>
                  {user?.avatar && (
                    <button
                      onClick={handleDeleteAvatar}
                      disabled={loadingAvatar}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition"
                    >
                      <Trash2 size={14} />
                      Xóa
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP, GIF. Tối đa 5MB.</p>
              </div>
            </div>
          </section>

          {/* ===== Đổi thông tin cá nhân ===== */}
          <section className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <UserIcon size={18} className="text-accent" />
              Thông tin cá nhân
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Họ tên</label>
                <input
                  value={profileForm.fullName}
                  onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  <Mail size={12} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              {profileMsg.text && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  profileMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {profileMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  {profileMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingProfile}
                className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition"
              >
                {loadingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Lưu thay đổi
              </button>
            </form>
          </section>

          {/* ===== Đổi mật khẩu ===== */}
          <section className="bg-dark-800 border border-dark-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Lock size={18} className="text-accent" />
              Đổi mật khẩu
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))}
                  required
                  placeholder="••••••"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={e => setPwdForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
                />
              </div>

              {pwdMsg.text && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  pwdMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                  {pwdMsg.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                  {pwdMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingPwd}
                className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition"
              >
                {loadingPwd ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                Đổi mật khẩu
              </button>
            </form>
          </section>

          {/* ===== 2FA ===== */}
          <TwoFactorSection />

        </div>
      </div>
    </>
  );
}