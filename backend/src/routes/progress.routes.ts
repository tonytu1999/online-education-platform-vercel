import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { updateProgress, getStudentProgress, getStudentLearningReport } from '../controllers/progress.controller';

const router = Router();
router.use(authenticate);

router.post('/update', updateProgress);
router.get('/:studentId/report', getStudentLearningReport);
router.get('/:studentId', getStudentProgress);

export default router;
