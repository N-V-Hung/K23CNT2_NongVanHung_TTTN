import { ChatMessage } from '../models/ChatMessage.js';
import { getAIResponse } from '../services/aiService.js';

export async function sendMessage(req, res, next) {
  try {
    const { message, history = [] } = req.body;
    const userId = req.user._id;

    await ChatMessage.create({ userId, role: 'user', content: message });
    const aiText = await getAIResponse(message, history);
    await ChatMessage.create({ userId, role: 'assistant', content: aiText });

    res.json({
      success: true,
      data: { content: aiText, timestamp: new Date().toISOString() },
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const messages = await ChatMessage.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ success: true, data: messages.reverse() });
  } catch (err) {
    next(err);
  }
}

export async function clearHistory(req, res, next) {
  try {
    await ChatMessage.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Đã xóa lịch sử chat' });
  } catch (err) {
    next(err);
  }
}