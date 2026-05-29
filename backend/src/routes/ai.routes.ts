import { Router, Response } from 'express';
import { authenticate, AuthRequest, authorizeRole } from '../middleware/auth';
import {
  chat,
  checkSessionMentalHealth,
  getMentalHealthHistory,
  createChatSession,
  getStudentSessions,
  getSessionDetails,
  deleteChatSession
} from '../controllers/ai.controller';

const router = Router();

router.use(authenticate);

// Test endpoint with auth
router.get('/test', (req: AuthRequest, res: Response) => {
  res.json({ message: 'AI routes are working!', userId: req.user?.id });
});

// Session management
router.post('/sessions', createChatSession);
router.get('/sessions', getStudentSessions);
router.get('/sessions/:sessionId', getSessionDetails);
router.delete('/sessions/:sessionId', deleteChatSession);

// Chat within a session (students allowed; mental health is auto-tracked as side-effect)
router.post('/chat', chat);

// ─────────────────────────────────────────────────────────────────────────────
// Mental health endpoints — RESTRICTED to TEACHER, SCHOOL_ADMIN, PARENT only
// Students are forbidden from directly querying mental health data or analysis.
// ─────────────────────────────────────────────────────────────────────────────
const mentalHealthGuard = authorizeRole(['TEACHER', 'SCHOOL_ADMIN', 'PARENT']);

// Whole-session mental health analysis (on-demand)
router.post('/sessions/:sessionId/mental-health', mentalHealthGuard, checkSessionMentalHealth);

// Mental health score history for charting
router.get('/mental-health/history', mentalHealthGuard, getMentalHealthHistory);

export default router;
