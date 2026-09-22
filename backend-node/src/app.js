import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import twoFactorRoutes from './routes/twoFactorRoutes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File tĩnh (avatar)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'IT Admin Assistant API', version: '1.0.0', database: 'MongoDB' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MongoDB', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/2fa', twoFactorRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;