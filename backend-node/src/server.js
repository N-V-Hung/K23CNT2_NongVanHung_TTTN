import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

import './models/User.js';
import './models/ChatMessage.js';

async function start() {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log('');
      console.log('🚀 ═══════════════════════════════════════════');
      console.log('   IT Admin Assistant API đang chạy');
      console.log(`   🌐 URL:      http://localhost:${env.port}`);
      console.log(`   💚 Health:   http://localhost:${env.port}/api/health`);
      console.log(`   🗄️  Database: MongoDB`);
      console.log(`   🔧 Mode:     ${env.nodeEnv}`);
      console.log(`   🤖 AI:       ${env.ai.useMock ? 'MOCK' : 'GEMINI'}`);
      console.log('═══════════════════════════════════════════');
      console.log('');
    });
  } catch (err) {
    console.error('❌ Không thể khởi động server:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Đang tắt server...');
  await disconnectDatabase();
  process.exit(0);
});

start();