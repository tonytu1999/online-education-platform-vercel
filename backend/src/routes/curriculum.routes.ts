import { Router } from 'express';
import { authenticate, authorizeRole } from '../middleware/auth';
import {
  getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject,
  getChaptersBySubject, createChapter, updateChapter, deleteChapter,
  getKnowledgePointsByChapter, createKnowledgePoint, updateKnowledgePoint, deleteKnowledgePoint
} from '../controllers/curriculum.controller';

const router = Router();
router.use(authenticate);

const canWrite = authorizeRole(['TEACHER', 'SCHOOL_ADMIN']);
const adminOnly = authorizeRole(['SCHOOL_ADMIN']);

// Subjects
router.get('/subjects', getSubjects);
router.get('/subjects/:id', getSubjectById);
router.post('/subjects', canWrite, createSubject);
router.put('/subjects/:id', canWrite, updateSubject);
router.delete('/subjects/:id', adminOnly, deleteSubject);

// Chapters
router.get('/subjects/:subjectId/chapters', getChaptersBySubject);
router.post('/subjects/:subjectId/chapters', canWrite, createChapter);
router.put('/chapters/:id', canWrite, updateChapter);
router.delete('/chapters/:id', adminOnly, deleteChapter);

// Knowledge Points
router.get('/chapters/:chapterId/knowledge-points', getKnowledgePointsByChapter);
router.post('/chapters/:chapterId/knowledge-points', canWrite, createKnowledgePoint);
router.put('/knowledge-points/:id', canWrite, updateKnowledgePoint);
router.delete('/knowledge-points/:id', adminOnly, deleteKnowledgePoint);

export default router;
