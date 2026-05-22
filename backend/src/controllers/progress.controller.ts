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
    const progress = await prisma.progress.findMany({
      where: { studentId },
      include: {
        knowledgePoint: {
          include: {
            chapter: {
              include: { subject: true }
            }
          }
        }
      }
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};
