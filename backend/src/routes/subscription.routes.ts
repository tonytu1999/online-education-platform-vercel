import { Router } from 'express';
import { getSubscription, upgradeSubscription } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Routes for PARENTS or STUDENTS to view/manage subscription
router.get('/', authenticate, getSubscription as any);
router.post('/upgrade', authenticate, upgradeSubscription as any);

export default router;
