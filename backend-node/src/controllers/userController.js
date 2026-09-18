import { User } from '../models/User.js';
import { ChatMessage } from '../models/ChatMessage.js';

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function toggleActive(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Không thể tự khóa chính mình' });
    }
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Không thể tự xóa chính mình' });
    }
    await user.deleteOne();
    await ChatMessage.deleteMany({ userId: user._id });
    res.json({ success: true, message: 'Đã xóa user' });
  } catch (err) {
    next(err);
  }
}