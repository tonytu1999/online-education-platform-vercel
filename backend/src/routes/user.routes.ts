import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, bindChild } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);
router.get('/profile', getProfile);
router.post('/bind-child', bindChild);

export default router;
