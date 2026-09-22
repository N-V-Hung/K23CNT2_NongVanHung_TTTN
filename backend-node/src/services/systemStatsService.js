import si from 'systeminformation';
import { SystemStats } from '../models/SystemStats.js';

// Đọc CPU/RAM thật rồi lưu vào MongoDB
export async function collectAndSaveStats() {
  try {
    const [cpu, mem, time, net] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.time(),
      si.networkStats(),
    ]);

    const networkSpeed = net[0]
      ? Math.round((net[0].rx_sec + net[0].tx_sec) / 1024 / 1024 * 100) / 100
      : 0;

    const stats = await SystemStats.create({
      cpu: Math.round(cpu.currentLoad),
      ram: Math.round((mem.active / mem.total) * 100),
      net: Math.max(0, networkSpeed),
      uptimePercent: 99.9,
    });

    // Chỉ giữ 100 bản ghi mới nhất
    const count = await SystemStats.countDocuments();
    if (count > 100) {
      const oldest = await SystemStats.find().sort({ createdAt: 1 }).limit(count - 100).select('_id');
      await SystemStats.deleteMany({ _id: { $in: oldest.map(s => s._id) } });
    }

    return stats;
  } catch (err) {
    console.error('Lỗi collect stats:', err.message);
    return null;
  }
}

// Lấy bản ghi mới nhất
export async function getLatestStats() {
  const latest = await SystemStats.findOne().sort({ createdAt: -1 }).lean();
  if (latest) return latest;

  // Nếu chưa có → tạo 1 bản ghi đầu tiên
  const fresh = await collectAndSaveStats();
  return fresh;
}