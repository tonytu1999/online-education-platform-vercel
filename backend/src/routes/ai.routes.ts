import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { chat, checkMentalHealth } from '../controllers/ai.controller';

const router = Router();
router.use(authenticate);

router.post('/chat', chat);
router.post('/mental-health', checkMentalHealth);

export default router;
