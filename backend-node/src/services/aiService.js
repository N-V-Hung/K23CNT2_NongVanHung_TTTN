import { env } from '../config/env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

function mockResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('server')) {
    return `### 🖥️ Trạng thái Server

| Server | CPU | RAM | Trạng thái |
|--------|-----|-----|------------|
| web-01 | 34% | 62% | ✅ Online |
| db-01  | 45% | 78% | ⚠️ Cảnh báo |

**Đề xuất:** Kiểm tra db-01.`;
  }

  if (lower.includes('bảo mật')) {
    return `### 🔒 Bảo mật 24h\n- **1,247** đăng nhập thành công\n- **23** đăng nhập thất bại`;
  }

  if (lower.includes('backup')) {
    return `### 💾 Backup\n- Lần cuối: **02:00 hôm nay** ✅\n- Kích thước: **45.2 GB**`;
  }

  return `Tôi đã nhận: **"${message}"**`;
}

async function geminiResponse(message, history) {
  const genAI = new GoogleGenerativeAI(env.ai.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: 'Bạn là trợ lý AI quản trị hệ thống CNTT. Trả lời bằng tiếng Việt.',
  });

  const chatHistory = history.slice(-10).map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }],
  }));

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

export async function getAIResponse(message, history = []) {
  if (env.ai.useMock || !env.ai.geminiApiKey) {
    return mockResponse(message);
  }

  try {
    return await geminiResponse(message, history);
  } catch (err) {
    console.error('Gemini error:', err.message);
    return `⚠️ Lỗi AI: ${err.message}\n\n${mockResponse(message)}`;
  }
}