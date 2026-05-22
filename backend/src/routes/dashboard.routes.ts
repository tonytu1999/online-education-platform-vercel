import { Router } from 'express';
import { getTeacherDashboard, getSchoolAdminDashboard } from '../controllers/dashboard.controller';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

// Routes for Teachers
router.get('/teacher', authenticate, authorizeRole(['TEACHER']), getTeacherDashboard as any);

// Routes for Admins
router.get('/admin', authenticate, authorizeRole(['SCHOOL_ADMIN']), getSchoolAdminDashboard as any);

export default router;
