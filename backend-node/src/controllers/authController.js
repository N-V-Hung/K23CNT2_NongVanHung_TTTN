import speakeasy from 'speakeasy';
import { User } from '../models/User.js';
import { signToken, verifyToken } from '../utils/jwt.js';

export async function register(req, res, next) {
  try {
    const { username, email, password, fullName } = req.body;

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username đã tồn tại' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const isFirstUser = (await User.countDocuments()) === 0;

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      fullName: fullName || username,
      password,
      role: isFirstUser ? 'admin' : 'user',
    });

    const token = signToken({ id: user._id, username: user.username, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
}

// ===== LOGIN =====
export async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).select('+password +twoFactorSecret');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Sai username hoặc mật khẩu' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Sai username hoặc mật khẩu' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });
    }

    // Nếu bật 2FA → yêu cầu mã
    if (user.twoFactorEnabled) {
      const tempToken = signToken(
        { id: user._id, username: user.username, step: '2fa' },
        '5m'
      );

      return res.json({
        success: true,
        require2FA: true,
        message: 'Vui lòng nhập mã xác thực từ Google Authenticator',
        data: { tempToken },
      });
    }

    // Không bật 2FA
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken({ id: user._id, username: user.username, role: user.role });
    user.password = undefined;
    user.twoFactorSecret = undefined;

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
}

// ===== VERIFY 2FA =====
export async function verifyLogin2FA(req, res, next) {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    // Verify tempToken
    let decoded;
    try {
      decoded = verifyToken(tempToken);
    } catch (err) {
      console.error('verify tempToken lỗi:', err.message);
      return res.status(401).json({ success: false, message: 'Phiên đã hết hạn, đăng nhập lại' });
    }

    if (decoded.step !== '2fa') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ success: false, message: 'User không hợp lệ' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: String(code).trim(),
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Mã xác thực không đúng' });
    }

    // Đúng → cấp token chính thức
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken({ id: user._id, username: user.username, role: user.role });
    user.password = undefined;
    user.twoFactorSecret = undefined;

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (err) {
    next(err);
  }
}