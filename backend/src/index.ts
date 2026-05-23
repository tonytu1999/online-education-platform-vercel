import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import progressRoutes from './routes/progress.routes';
import aiRoutes from './routes/ai.routes';
import classRoutes from './routes/class.routes';
import schoolRoutes from './routes/school.routes';
import prisma from './config/prisma';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
app.use('/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/schools', schoolRoutes);
app.get('/users/uuid-by-email', async (req, res) => {
  const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';

  if (!email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }

  const student = await prisma.user.findFirst({
    where: { email, role: 'STUDENT' },
    select: { id: true }
  });

  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  res.json({ id: student.id });
});

app.get('/api/users/uuid-by-email', async (req, res) => {
  const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';

  if (!email) {
    res.status(400).json({ error: 'email is required' });
    return;
  }

  const student = await prisma.user.findFirst({
    where: { email, role: 'STUDENT' },
    select: { id: true }
  });

  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  res.json({ id: student.id });
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Fallback API response',
    method: req.method,
    path: req.originalUrl
  });
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
