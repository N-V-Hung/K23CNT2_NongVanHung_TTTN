import { User } from '../models/User.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import path from 'path';
import fs from 'fs';

// ===== PUT /api/profile — Cập nhật họ tên, email =====
export async function updateProfile(req, res, next) {
  try {
    const { fullName, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    // Kiểm tra email trùng
    if (email && email.toLowerCase() !== user.email) {
      const dup = await User.findOne({ email: email.toLowerCase() });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
      }
      user.email = email.toLowerCase();
    }

    if (fullName !== undefined) user.fullName = fullName;

    await user.save();

    res.json({
      success: true,
      message: 'Đã cập nhật thông tin',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

// ===== PUT /api/profile/password — Đổi mật khẩu =====
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới tối thiểu 6 ký tự' });
    }

    // Cần select +password vì password mặc định bị ẩn
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    const ok = await user.comparePassword(currentPassword);
    if (!ok) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = newPassword;   // pre('save') hook sẽ hash lại
    await user.save();

    res.json({ success: true, message: 'Đã đổi mật khẩu thành công' });
  } catch (err) {
    next(err);
  }
}

// ===== POST /api/profile/avatar — Upload avatar =====
export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Chưa chọn file' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      // Xóa file vừa upload nếu user không tồn tại
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      const oldPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
      }
    }

    // Lưu đường dẫn tương đối
    const relativePath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = relativePath;
    await user.save();

    res.json({
      success: true,
      message: 'Đã cập nhật avatar',
      data: { avatar: relativePath, user },
    });
  } catch (err) {
    next(err);
  }
}

// ===== DELETE /api/profile/avatar — Xóa avatar =====
export async function deleteAvatar(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    }

    if (user.avatar) {
      const oldPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { /* ignore */ }
      }
    }

    user.avatar = '';
    await user.save();

    res.json({ success: true, message: 'Đã xóa avatar', data: { user } });
  } catch (err) {
    next(err);
  }
}