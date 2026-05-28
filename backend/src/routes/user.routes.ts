import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, bindChild, getChildren, unbindChild, getStudentUuidByEmail } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);
router.get('/uuid-by-email', getStudentUuidByEmail);
router.get('/profile', getProfile);
router.post('/bind-child', bindChild);
router.get('/children', getChildren);
router.delete('/children/:childId', unbindChild);

export default router;
