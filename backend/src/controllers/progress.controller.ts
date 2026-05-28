import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, knowledgePointId, mastery, studyTimeSeconds } = req.body;
    
    const progress = await prisma.progress.upsert({
      where: {
        studentId_knowledgePointId: {
          studentId,
          knowledgePointId
        }
      },
      create: {
        studentId,
        knowledgePointId,
        mastery,
        studyTimeSeconds
      },
      update: {
        mastery,
        studyTimeSeconds: {
          increment: studyTimeSeconds || 0
        }
      }
    });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
};

export const getStudentProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;
    const { id: requesterId, role } = req.user!;

    if (role === 'STUDENT' && requesterId !== studentId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const progress = await prisma.progress.findMany({
      where: { studentId },
      include: {
        knowledgePoint: {
          include: { chapter: { include: { subject: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

// Grouped report suitable for teacher / parent views
export const getStudentLearningReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId as string;
    const { id: requesterId, role } = req.user!;

    if (role === 'STUDENT' && requesterId !== studentId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true }
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const progress = await prisma.progress.findMany({
      where: { studentId },
      include: {
        knowledgePoint: {
          include: { chapter: { include: { subject: true } } }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Group by subject → chapter → knowledge points
    const subjectMap: Record<string, {
      subject: string;
      chapters: Record<string, {
        chapter: string;
        knowledgePoints: Array<{ name: string; mastery: string; studyTimeSeconds: number; updatedAt: Date }>;
      }>;
    }> = {};

    for (const p of progress) {
      const subjectName = p.knowledgePoint.chapter.subject.name;
      const chapterName = p.knowledgePoint.chapter.name;

      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = { subject: subjectName, chapters: {} };
      }
      if (!subjectMap[subjectName].chapters[chapterName]) {
        subjectMap[subjectName].chapters[chapterName] = { chapter: chapterName, knowledgePoints: [] };
      }
      subjectMap[subjectName].chapters[chapterName].knowledgePoints.push({
        name: p.knowledgePoint.name,
        mastery: p.mastery,
        studyTimeSeconds: p.studyTimeSeconds,
        updatedAt: p.updatedAt
      });
    }

    res.json({
      student,
      summary: {
        totalKnowledgePoints: progress.length,
        mastered: progress.filter(p => p.mastery === 'MASTERED').length,
        partial: progress.filter(p => p.mastery === 'PARTIAL').length,
        unmastered: progress.filter(p => p.mastery === 'UNMASTERED').length,
        totalStudyTimeSeconds: progress.reduce((acc, p) => acc + p.studyTimeSeconds, 0)
      },
      subjects: Object.values(subjectMap).map(s => ({
        subject: s.subject,
        chapters: Object.values(s.chapters)
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate learning report' });
  }
};
