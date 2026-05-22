import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updateProgress, getStudentProgress } from '../controllers/progress.controller';

const router = Router();
router.use(authenticate);

router.post('/update', updateProgress);
router.get('/:studentId', getStudentProgress);

export default router;
