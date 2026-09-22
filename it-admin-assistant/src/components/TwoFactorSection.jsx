import { useState, useEffect } from 'react';
import {
  Shield, Loader2, Check, AlertCircle, Copy, X, KeyRound,
} from 'lucide-react';
import { get2FAStatus, setup2FA, verify2FA, disable2FA } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TwoFactorSection() {
  const { user, setUserData } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Setup state
  const [setupData, setSetupData] = useState(null); // { secret, qrCode }
  const [token, setToken] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Disable state
  const [showDisable, setShowDisable] = useState(false);
  const [disablePwd, setDisablePwd] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await get2FAStatus();
        setEnabled(res.enabled);
      } catch (err) {
        console.error('Không load được trạng thái 2FA:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Bắt đầu setup
  const handleStartSetup = async () => {
    setSetupError('');
    setSetupLoading(true);
    try {
      const res = await setup2FA();
      setSetupData(res);
    } catch (err) {
      setSetupError(err.response?.data?.message || err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  // Copy secret
  const handleCopySecret = () => {
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Xác nhận mã 6 số → bật
  const handleVerify = async (e) => {
    e.preventDefault();
    setSetupError('');
    setSetupLoading(true);
    try {
      await verify2FA(token);
      setEnabled(true);
      setSetupData(null);
      setToken('');
      setSuccessMsg('Đã bật xác thực 2 yếu tố!');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Cập nhật lại user trong context
      if (user) setUserData({ ...user, twoFactorEnabled: true });
    } catch (err) {
      setSetupError(err.response?.data?.message || err.message);
    } finally {
      setSetupLoading(false);
    }
  };

  // Tắt 2FA
  const handleDisable = async (e) => {
    e.preventDefault();
    setDisableError('');
    setDisableLoading(true);
    try {
      await disable2FA(disablePwd);
      setEnabled(false);
      setShowDisable(false);
      setDisablePwd('');
      setSuccessMsg('Đã tắt 2FA');
      setTimeout(() => setSuccessMsg(''), 3000);

      if (user) setUserData({ ...user, twoFactorEnabled: false });
    } catch (err) {
      setDisableError(err.response?.data?.message || err.message);
    } finally {
      setDisableLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-dark-800 border border-dark-700 rounded-xl p-6 flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 size={14} className="animate-spin" />
        Đang tải cấu hình bảo mật...
      </section>
    );
  }

  return (
    <section className="bg-dark-800 border border-dark-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Shield size={18} className={enabled ? 'text-green-400' : 'text-accent'} />
          Xác thực 2 yếu tố (2FA)
        </h3>
        {enabled ? (
          <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
            ● Đang bật
          </span>
        ) : (
          <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-400">
            ● Đang tắt
          </span>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          <Check size={14} />
          {successMsg}
        </div>
      )}

      {/* ===== Chưa bật → nút bật ===== */}
      {!enabled && !setupData && (
        <>
          <p className="text-sm text-gray-400 mb-4">
            Thêm lớp bảo vệ bằng cách yêu cầu mã 6 số từ app Google Authenticator
            mỗi khi đăng nhập. Kể cả ai biết mật khẩu cũng không vào được.
          </p>
          <button
            onClick={handleStartSetup}
            disabled={setupLoading}
            className="w-full py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition"
          >
            {setupLoading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            Bật xác thực 2 yếu tố
          </button>
        </>
      )}

      {/* ===== Đang setup → hiện QR ===== */}
      {!enabled && setupData && (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
            <p className="font-medium mb-1">📱 Bước 1: Cài Google Authenticator</p>
            <p>Tải app "Google Authenticator" trên điện thoại (iOS/Android).</p>
          </div>

          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs">
            <p className="font-medium mb-1">📷 Bước 2: Quét QR</p>
            <p>Mở app → bấm dấu "+" → chọn "Quét mã QR".</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center bg-white p-4 rounded-lg">
            <img src={setupData.qrCode} alt="QR Code" className="w-48 h-48" />
          </div>

          {/* Secret thủ công */}
          <div>
            <p className="text-xs text-gray-400 mb-1">
              Hoặc nhập thủ công mã này vào app:
            </p>
            <div className="flex gap-2">
              <code className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-xs text-white font-mono break-all">
                {setupData.secret}
              </code>
              <button
                onClick={handleCopySecret}
                className="px-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 transition"
                title="Sao chép"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs">
            <p className="font-medium mb-1">✍️ Bước 3: Nhập mã 6 số</p>
            <p>Sau khi quét, app sẽ hiển thị mã 6 số. Nhập vào ô dưới để xác nhận.</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-3">
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-3 text-center text-2xl font-mono tracking-widest text-white focus:outline-none focus:border-accent"
            />

            {setupError && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle size={14} />
                {setupError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setSetupData(null); setToken(''); setSetupError(''); }}
                className="flex-1 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={token.length !== 6 || setupLoading}
                className="flex-1 py-2.5 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2"
              >
                {setupLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Xác nhận & Bật
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Đang bật → nút tắt ===== */}
      {enabled && !showDisable && (
        <>
          <p className="text-sm text-gray-400 mb-4">
            ✅ Tài khoản của bạn đã được bảo vệ bằng 2FA. Mỗi lần đăng nhập
            sẽ cần thêm mã 6 số từ Google Authenticator.
          </p>
          <button
            onClick={() => setShowDisable(true)}
            className="w-full py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium flex items-center justify-center gap-2 transition"
          >
            <X size={14} />
            Tắt 2FA
          </button>
        </>
      )}

      {/* ===== Form tắt 2FA ===== */}
      {enabled && showDisable && (
        <form onSubmit={handleDisable} className="space-y-3">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
            ⚠️ Tắt 2FA sẽ làm tài khoản **kém an toàn hơn**. Xác nhận bằng mật khẩu.
          </div>

          <input
            type="password"
            value={disablePwd}
            onChange={e => setDisablePwd(e.target.value)}
            placeholder="Nhập mật khẩu hiện tại"
            required
            className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent"
          />

          {disableError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              <AlertCircle size={14} />
              {disableError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowDisable(false); setDisablePwd(''); setDisableError(''); }}
              className="flex-1 py-2.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-300 text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!disablePwd || disableLoading}
              className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2"
            >
              {disableLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Xác nhận tắt
            </button>
          </div>
        </form>
      )}
    </section>
  );
}