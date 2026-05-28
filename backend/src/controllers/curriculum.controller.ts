import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

// ── Subjects ─────────────────────────────────────────────────────────────────

export const getSubjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          include: { knowledgePoints: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(subjects);
  } catch {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

export const getSubjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: {
        chapters: {
          include: { knowledgePoints: true }
        }
      }
    });
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(subject);
  } catch {
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
};

export const createSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const subject = await prisma.subject.create({ data: { name } });
    res.status(201).json(subject);
  } catch {
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(subject);
  } catch {
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.subject.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

// ── Chapters ──────────────────────────────────────────────────────────────────

export const getChaptersBySubject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { subjectId: req.params.subjectId },
      include: { knowledgePoints: true },
      orderBy: { name: 'asc' }
    });
    res.json(chapters);
  } catch {
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
};

export const createChapter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const chapter = await prisma.chapter.create({
      data: { name, subjectId: req.params.subjectId }
    });
    res.status(201).json(chapter);
  } catch {
    res.status(500).json({ error: 'Failed to create chapter' });
  }
};

export const updateChapter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    const chapter = await prisma.chapter.update({
      where: { id: req.params.id },
      data: { name }
    });
    res.json(chapter);
  } catch {
    res.status(500).json({ error: 'Failed to update chapter' });
  }
};

export const deleteChapter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.chapter.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Chapter not found' });
      return;
    }
    await prisma.chapter.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
};

// ── Knowledge Points ──────────────────────────────────────────────────────────

export const getKnowledgePointsByChapter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const knowledgePoints = await prisma.knowledgePoint.findMany({
      where: { chapterId: req.params.chapterId },
      orderBy: { name: 'asc' }
    });
    res.json(knowledgePoints);
  } catch {
    res.status(500).json({ error: 'Failed to fetch knowledge points' });
  }
};

export const createKnowledgePoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, desc } = req.body;
    const kp = await prisma.knowledgePoint.create({
      data: { name, desc, chapterId: req.params.chapterId }
    });
    res.status(201).json(kp);
  } catch {
    res.status(500).json({ error: 'Failed to create knowledge point' });
  }
};

export const updateKnowledgePoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, desc } = req.body;
    const kp = await prisma.knowledgePoint.update({
      where: { id: req.params.id },
      data: { name, desc }
    });
    res.json(kp);
  } catch {
    res.status(500).json({ error: 'Failed to update knowledge point' });
  }
};

export const deleteKnowledgePoint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.knowledgePoint.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Knowledge point not found' });
      return;
    }
    await prisma.knowledgePoint.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete knowledge point' });
  }
};
