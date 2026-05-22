import { Router } from 'express';
import { getSystemConfig, updateSystemConfig, getForbiddenKeywords, createForbiddenKeyword, deleteForbiddenKeyword } from '../controllers/system.controller';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

// Routes for ADMIN to manage system AI settings
router.get('/config', authenticate, authorizeRole(['SCHOOL_ADMIN']), getSystemConfig as any);
router.put('/config', authenticate, authorizeRole(['SCHOOL_ADMIN']), updateSystemConfig as any);

// Routes for ADMIN to manage forbidden keywords
router.get('/keywords', authenticate, authorizeRole(['SCHOOL_ADMIN']), getForbiddenKeywords as any);
router.post('/keywords', authenticate, authorizeRole(['SCHOOL_ADMIN']), createForbiddenKeyword as any);
router.delete('/keywords/:id', authenticate, authorizeRole(['SCHOOL_ADMIN']), deleteForbiddenKeyword as any);

export default router;
