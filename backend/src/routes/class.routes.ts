import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import { createClass, joinClass, getStudents, removeStudent } from '../controllers/class.controller';

const router = Router();
router.use(authenticate);

// Student routes
router.post('/join', authorizeRole(['STUDENT']), joinClass);

// Teacher routes
router.post('/', authorizeRole(['TEACHER', 'SCHOOL_ADMIN']), createClass);
router.get('/:classId/students', authorizeRole(['TEACHER', 'SCHOOL_ADMIN']), getStudents);
router.delete('/:classId/students/:studentId', authorizeRole(['TEACHER', 'SCHOOL_ADMIN']), removeStudent);

export default router;
