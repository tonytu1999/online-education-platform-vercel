import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import { createSchool, getSchools } from '../controllers/school.controller';

const router = Router();
router.use(authenticate);

// Everyone can view schools
router.get('/', getSchools);

// Only admins can create schools
router.post('/', authorizeRole(['SCHOOL_ADMIN']), createSchool);

export default router;
