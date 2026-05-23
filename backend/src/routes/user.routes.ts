import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, bindChild, getStudentUuidByEmail } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);
router.get('/uuid-by-email', getStudentUuidByEmail);
router.get('/profile', getProfile);
router.post('/bind-child', bindChild);

export default router;
