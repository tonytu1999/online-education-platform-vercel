import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code, schoolId } = req.body;
    const teacherId = req.user!.id;

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      res.status(404).json({ error: 'School not found' });
      return;
    }

    const newClass = await prisma.class.create({
      data: { name, code, schoolId, teacherId }
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class' });
  }
};

export const joinClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classCode } = req.body;
    const studentId = req.user!.id;

    const classRecord = await prisma.class.findUnique({ where: { code: classCode } });
    if (!classRecord) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    await prisma.classStudent.create({
      data: { classId: classRecord.id, studentId }
    });

    res.json({ message: 'Successfully joined the class' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join class' });
  }
};

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classId = req.params.classId as string;

    if (req.user!.role === 'TEACHER') {
      const cls = await prisma.class.findUnique({ where: { id: classId } });
      if (cls?.teacherId !== req.user!.id) {
        res.status(403).json({ error: 'Not authorized for this class' });
        return;
      }
    }

    const classStudents = await prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            progressRecords: {
              select: { mastery: true, studyTimeSeconds: true, updatedAt: true },
            },
            mentalHealthRecords: {
              orderBy: { createdAt: 'desc' },
              take: 14,
              select: { statusScore: true, riskLevel: true, emotionPolarity: true, keywords: true },
            },
            chatSessions: {
              orderBy: { lastAccessedAt: 'desc' },
              take: 1,
              select: { lastAccessedAt: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();

    const result = classStudents.map((cs) => {
      const s = cs.student;
      const progress = s.progressRecords;
      const mhRecords = s.mentalHealthRecords; // desc by createdAt
      const latestMH = mhRecords[0] ?? null;

      const latestProgressAt = progress.reduce<Date | null>(
        (max, p) => (!max || p.updatedAt > max ? p.updatedAt : max),
        null,
      );
      const latestChatAt = s.chatSessions[0]?.lastAccessedAt ?? null;
      const lastActiveAt =
        latestProgressAt && latestChatAt
          ? latestProgressAt > latestChatAt ? latestProgressAt : latestChatAt
          : latestProgressAt ?? latestChatAt;

      const studyTimeSeconds = progress.reduce((sum, p) => sum + p.studyTimeSeconds, 0);
      const masteredCount = progress.filter((p) => p.mastery === 'MASTERED').length;
      const partialCount = progress.filter((p) => p.mastery === 'PARTIAL').length;

      // Mental health trend: statusScores oldest→newest (API returns newest first)
      const mentalHealthTrend = [...mhRecords].reverse().map((r) => r.statusScore);

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        joinedAt: cs.createdAt,
        lastActiveAt,
        studyTimeSeconds,
        masteredCount,
        partialCount,
        progressCount: progress.length,
        mentalHealthRisk: latestMH?.riskLevel ?? null,
        mentalHealthScore: latestMH?.statusScore ?? null,
        mentalHealthPolarity: latestMH?.emotionPolarity ?? null,
        mentalHealthKeywords: latestMH?.keywords ?? null,
        mentalHealthTrend,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

export const removeStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classId = req.params.classId as string;
    const studentId = req.params.studentId as string;

    if (req.user!.role === 'TEACHER') {
      const cls = await prisma.class.findUnique({ where: { id: classId } });
      if (cls?.teacherId !== req.user!.id) {
        res.status(403).json({ error: 'Not authorized for this class' });
        return;
      }
    }

    await prisma.classStudent.delete({
      where: {
        classId_studentId: { classId, studentId }
      }
    });

    res.json({ message: 'Student removed from class' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove student' });
  }
};
