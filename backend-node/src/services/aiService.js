import { env } from '../config/env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Server } from '../models/Server.js';
import { User } from '../models/User.js';
import { ChatMessage } from '../models/ChatMessage.js';

// ============================================================
// 1. HÀM LẤY CONTEXT TỪ DATABASE
// ============================================================

async function getSystemContext() {
  try {
    const [servers, userCount, msgCount] = await Promise.all([
      Server.find().sort({ name: 1 }).lean(),
      User.countDocuments(),
      ChatMessage.countDocuments(),
    ]);

    const online = servers.filter(s => s.status === 'online').length;
    const warning = servers.filter(s => s.status === 'warning').length;
    const offline = servers.filter(s => s.status === 'offline').length;

    let context = `\n=== DỮ LIỆU HỆ THỐNG THẬT (từ MongoDB) ===\n`;
    context += `- Tổng server: ${servers.length} (Online: ${online}, Cảnh báo: ${warning}, Offline: ${offline})\n`;
    context += `- Tổng user: ${userCount}\n`;
    context += `- Tổng tin nhắn chat: ${msgCount}\n`;

    if (servers.length > 0) {
      context += `\n**Danh sách server:**\n`;
      context += `| Tên | IP | Nhóm | CPU | RAM | Trạng thái |\n`;
      context += `|-----|-----|------|-----|-----|------------|\n`;
      servers.forEach(s => {
        const statusText = s.status === 'online' ? '✅ Online'
          : s.status === 'warning' ? '⚠️ Cảnh báo' : '❌ Offline';
        context += `| ${s.name} | ${s.ip} | ${s.group || 'default'} | ${s.cpu}% | ${s.ram}% | ${statusText} |\n`;
      });

      // Cảnh báo server quá tải
      const overloaded = servers.filter(s => s.cpu >= 80 || s.ram >= 80);
      if (overloaded.length > 0) {
        context += `\n**⚠️ Server quá tải (CPU/RAM ≥ 80%):**\n`;
        overloaded.forEach(s => {
          context += `- ${s.name}: CPU ${s.cpu}%, RAM ${s.ram}%\n`;
        });
      }
    }

    context += `\n=== HẾT DỮ LIỆU ===\n`;
    return context;
  } catch (err) {
    console.error('Lỗi lấy context:', err.message);
    return '';
  }
}

// ============================================================
// 2. MOCK RESPONSE (khi chưa có Gemini key)
// ============================================================

async function mockResponse(message) {
  const lower = message.toLowerCase();

  // Trả lời động dựa trên dữ liệu thật
  if (lower.includes('server')) {
    const servers = await Server.find().sort({ name: 1 }).lean();

    if (servers.length === 0) {
      return `### 🖥️ Trạng thái Server\n\n**Chưa có server nào trong hệ thống.**\n\nAdmin vào *Giám sát hệ thống* để thêm server.`;
    }

    const online = servers.filter(s => s.status === 'online').length;
    const warning = servers.filter(s => s.status === 'warning').length;
    const offline = servers.filter(s => s.status === 'offline').length;

    let md = `### 🖥️ Trạng thái Server (dữ liệu thật)\n\n`;
    md += `**Tổng: ${servers.length}** — Online: **${online}**, Cảnh báo: **${warning}**, Offline: **${offline}**\n\n`;
    md += `| Tên | IP | CPU | RAM | Trạng thái |\n`;
    md += `|-----|-----|-----|-----|------------|\n`;
    servers.forEach(s => {
      const icon = s.status === 'online' ? '✅' : s.status === 'warning' ? '⚠️' : '❌';
      const label = s.status === 'online' ? 'Online' : s.status === 'warning' ? 'Cảnh báo' : 'Offline';
      md += `| ${s.name} | ${s.ip} | ${s.cpu}% | ${s.ram}% | ${icon} ${label} |\n`;
    });

    const overloaded = servers.filter(s => s.cpu >= 80 || s.ram >= 80);
    if (overloaded.length > 0) {
      md += `\n**⚠️ Đề xuất:** Kiểm tra các server sau vì tài nguyên cao:\n`;
      overloaded.forEach(s => {
        md += `- **${s.name}** — CPU ${s.cpu}%, RAM ${s.ram}%\n`;
      });
    } else {
      md += `\n✅ Tất cả server đang hoạt động bình thường.`;
    }

    return md;
  }

  if (lower.includes('bảo mật') || lower.includes('security')) {
    const userCount = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const locked = await User.countDocuments({ isActive: false });

    return `### 🔒 Bảo mật hệ thống\n\n` +
      `- **${userCount}** tài khoản người dùng\n` +
      `- **${admins}** admin, **${userCount - admins}** user\n` +
      `- **${locked}** tài khoản đã bị khóa\n` +
      `\n**Khuyến nghị:** Kiểm tra user bị khóa và đảm bảo mật khẩu mạnh.`;
  }

  if (lower.includes('backup')) {
    return `### 💾 Tình trạng Backup\n\n` +
      `- Lần backup cuối: **02:00 hôm nay** ✅\n` +
      `- Kích thước: **45.2 GB**\n` +
      `- Vị trí: \`s3://backups/db-prod/\``;
  }

  if (lower.includes('user') || lower.includes('người dùng')) {
    const users = await User.find().sort({ createdAt: -1 }).limit(20).lean();
    if (users.length === 0) {
      return `Chưa có user nào trong hệ thống.`;
    }
    let md = `### 👥 Danh sách User (${users.length})\n\n| Username | Role | Trạng thái |\n|----------|------|------------|\n`;
    users.forEach(u => {
      const role = u.role === 'admin' ? '👑 Admin' : '👤 User';
      const status = u.isActive ? '● Hoạt động' : '● Đã khóa';
      md += `| ${u.username} | ${role} | ${status} |\n`;
    });
    return md;
  }

  if (lower.includes('thống kê') || lower.includes('tổng quan')) {
    const [serverCount, userCount, msgCount] = await Promise.all([
      Server.countDocuments(),
      User.countDocuments(),
      ChatMessage.countDocuments(),
    ]);
    return `### 📊 Tổng quan hệ thống\n\n` +
      `- **Server:** ${serverCount}\n` +
      `- **User:** ${userCount}\n` +
      `- **Tin nhắn chat:** ${msgCount}`;
  }

  return `Tôi đã nhận: **"${message}"**

Tôi có thể hỗ trợ:
- 🖥️ **Kiểm tra server** — gõ "server"
- 🔒 **Bảo mật** — gõ "bảo mật"
- 💾 **Backup** — gõ "backup"
- 👥 **Danh sách user** — gõ "user"
- 📊 **Tổng quan** — gõ "thống kê"`;
}

// ============================================================
// 3. GEMINI RESPONSE (dùng AI thật + context từ DB)
// ============================================================

async function geminiResponse(message, history) {
  const genAI = new GoogleGenerativeAI(env.ai.geminiApiKey);

  // Lấy dữ liệu thật từ DB
  const context = await getSystemContext();

  const systemPrompt = `Bạn là **trợ lý AI quản trị hệ thống CNTT** (IT Admin Assistant).
Trả lời bằng tiếng Việt, ngắn gọn, chuyên nghiệp.

${context}

**HƯỚNG DẪN QUAN TRỌNG:**
1. Khi user hỏi về server/user/hệ thống → LUÔN dùng dữ liệu thật ở trên
2. Trình bày bảng markdown khi liệt kê nhiều mục
3. Nếu phát hiện server quá tải (CPU/RAM ≥ 80%) → cảnh báo ngay
4. Không tự bịa thông tin không có trong dữ liệu
5. Nếu dữ liệu trống → hướng dẫn user cách thêm`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });

  const chatHistory = history.slice(-10).map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }],
  }));

  const chat = model.startChat({ history: chatHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ============================================================
// 4. HÀM CHÍNH
// ============================================================

export async function getAIResponse(message, history = []) {
  if (env.ai.useMock || !env.ai.geminiApiKey) {
    return mockResponse(message);
  }

  try {
    return await geminiResponse(message, history);
  } catch (err) {
    console.error('Gemini error:', err.message);
    return `⚠️ Lỗi AI: ${err.message}\n\n${await mockResponse(message)}`;
  }
}