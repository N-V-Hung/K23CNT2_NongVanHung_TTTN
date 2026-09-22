import mongoose from 'mongoose';

const systemStatsSchema = new mongoose.Schema(
  {
    cpu: { type: Number, default: 0, min: 0, max: 100 },
    ram: { type: Number, default: 0, min: 0, max: 100 },
    net: { type: Number, default: 0 },
    uptimePercent: { type: Number, default: 99.9 },
  },
  { timestamps: true }
);

export const SystemStats = mongoose.model('SystemStats', systemStatsSchema);