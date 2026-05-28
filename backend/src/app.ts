import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import schoolRoutes from './routes/school.routes';
import classRoutes from './routes/class.routes';
import aiRoutes from './routes/ai.routes';
import progressRoutes from './routes/progress.routes';
import systemRoutes from './routes/system.routes';
import subscriptionRoutes from './routes/subscription.routes';
import dashboardRoutes from './routes/dashboard.routes';
import curriculumRoutes from './routes/curriculum.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const startedAt = Date.now();
  const requestBody = ['POST', 'PUT', 'PATCH'].includes(req.method) ? req.body : undefined;

  console.log(`[${new Date().toISOString()}] -> ${req.method} ${req.originalUrl}`);
  if (requestBody !== undefined) {
    console.log('Body:', requestBody);
  }

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    console.log(`[${new Date().toISOString()}] <- ${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`);
  });

  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/curriculum', curriculumRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
