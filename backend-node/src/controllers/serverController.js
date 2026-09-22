import { Server } from '../models/Server.js';
import { getLatestStats } from '../services/systemStatsService.js';

// ===== GET /api/servers =====
export async function listServers(req, res, next) {
  try {
    const { group, status } = req.query;
    const filter = {};
    if (group) filter.group = group;
    if (status) filter.status = status;

    const servers = await Server.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: servers });
  } catch (err) {
    next(err);
  }
}

// ===== GET /api/servers/count =====
export async function getServerCounts(req, res, next) {
  try {
    const [total, online, warning, offline] = await Promise.all([
      Server.countDocuments(),
      Server.countDocuments({ status: 'online' }),
      Server.countDocuments({ status: 'warning' }),
      Server.countDocuments({ status: 'offline' }),
    ]);

    res.json({
      success: true,
      data: { total, online, warning, offline },
    });
  } catch (err) {
    next(err);
  }
}

// ===== GET /api/servers/system =====
export async function getSystemStats(req, res, next) {
  try {
    const stats = await getLatestStats();

    res.json({
      success: true,
      data: {
        cpu: stats?.cpu ?? 0,
        ram: stats?.ram ?? 0,
        net: stats?.net ?? 0,
        uptimePercent: stats?.uptimePercent ?? 99.9,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ===== GET /api/servers/:id =====
export async function getServer(req, res, next) {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy server' });
    }
    res.json({ success: true, data: server });
  } catch (err) {
    next(err);
  }
}

// ===== POST /api/servers (chỉ admin) =====
export async function createServer(req, res, next) {
  try {
    const { name, ip, group, cpu, ram, status, note } = req.body;

    const existing = await Server.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Tên server đã tồn tại' });
    }

    const server = await Server.create({
      name,
      ip,
      group: group || 'default',
      cpu: cpu ?? 0,
      ram: ram ?? 0,
      status: status || 'online',
      note: note || '',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Đã thêm server',
      data: server,
    });
  } catch (err) {
    next(err);
  }
}

// ===== PUT /api/servers/:id (chỉ admin) =====
export async function updateServer(req, res, next) {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy server' });
    }

    const { name, ip, group, status, note, cpu, ram } = req.body;

    if (name && name !== server.name) {
      const dup = await Server.findOne({ name });
      if (dup) {
        return res.status(400).json({ success: false, message: 'Tên server đã tồn tại' });
      }
    }

    if (name !== undefined) server.name = name;
    if (ip !== undefined) server.ip = ip;
    if (group !== undefined) server.group = group;
    if (status !== undefined) server.status = status;
    if (note !== undefined) server.note = note;
    if (cpu !== undefined) server.cpu = cpu;
    if (ram !== undefined) server.ram = ram;

    await server.save();

    res.json({
      success: true,
      message: 'Đã cập nhật server',
      data: server,
    });
  } catch (err) {
    next(err);
  }
}

// ===== DELETE /api/servers/:id (chỉ admin) =====
export async function deleteServer(req, res, next) {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy server' });
    }

    await server.deleteOne();
    res.json({ success: true, message: 'Đã xóa server' });
  } catch (err) {
    next(err);
  }
}

// ===== POST /api/servers/:id/restart (chỉ admin) =====
export async function restartServer(req, res, next) {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy server' });
    }

    server.status = 'online';
    await server.save();

    res.json({
      success: true,
      message: `Đã gửi lệnh restart tới ${server.name}`,
      data: server,
    });
  } catch (err) {
    next(err);
  }
}