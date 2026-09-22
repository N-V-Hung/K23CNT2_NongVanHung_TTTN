import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User.js';

// ===== POST /api/2fa/setup — Tạo secret + QR =====
export async function setup2FA(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: '2FA đã được bật' });
    }

    // Tạo secret mới
    const secret = speakeasy.generateSecret({
      name: `IT Admin (${user.username})`,
      issuer: 'IT Admin Assistant',
      length: 32,
    });

    // Tạo ảnh QR
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Lưu secret tạm vào DB (chưa bật, chờ verify)
    user.twoFactorSecret = secret.base32;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        otpauth: secret.otpauth_url,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ===== POST /api/2fa/verify — Xác nhận mã 6 số → BẬT 2FA =====
export async function verify2FA(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Thiếu mã xác thực' });
    }

    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Chưa setup 2FA' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: String(token).trim(),
      window: 1, // cho phép lệch 30s
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Mã xác thực không đúng' });
    }

    user.twoFactorEnabled = true;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Đã bật 2FA thành công' });
  } catch (err) {
    next(err);
  }
}

// ===== POST /api/2fa/disable — Tắt 2FA (cần mật khẩu) =====
export async function disable2FA(req, res, next) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Nhập mật khẩu để tắt 2FA' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Mật khẩu không đúng' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Đã tắt 2FA' });
  } catch (err) {
    next(err);
  }
}

// ===== GET /api/2fa/status — Kiểm tra trạng thái =====
export async function getStatus(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      data: { enabled: user?.twoFactorEnabled || false },
    });
  } catch (err) {
    next(err);
  }
}