import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/it_admin_assistant',
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    useMock: process.env.USE_MOCK_AI === 'true',
  },
};