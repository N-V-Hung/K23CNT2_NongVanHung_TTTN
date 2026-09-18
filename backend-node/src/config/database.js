import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`✅ Kết nối MongoDB thành công: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB đã ngắt kết nối');
    });
  } catch (error) {
    console.error('❌ Không thể kết nối MongoDB:', error.message);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}