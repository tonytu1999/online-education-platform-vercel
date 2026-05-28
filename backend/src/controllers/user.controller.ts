import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { id: true, name: true, email: true, phone: true, role: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentUuidByEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';

    if (!email) {
      res.status(400).json({ error: 'email is required' });
      return;
    }

    const student = await prisma.user.findFirst({
      where: { email, role: 'STUDENT' },
      select: { id: true }
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json({ id: student.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get student uuid' });
  }
};

export const bindChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'PARENT') {
      res.status(403).json({ error: 'For parents only' });
      return;
    }
    const { childId } = req.body;
    if (!childId) {
      res.status(400).json({ error: 'childId is required' });
      return;
    }
    const parentId = req.user.id;

    const child = await prisma.user.findUnique({
      where: { id: childId },
      select: { role: true }
    });
    if (!child) {
      res.status(404).json({ error: 'Child not found' });
      return;
    }
    if (child.role !== 'STUDENT') {
      res.status(400).json({ error: 'The specified user is not a student' });
      return;
    }

    await prisma.userParent.create({ data: { parentId, childId } });
    res.json({ message: 'Child bound successfully' });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'Child is already linked to this parent' });
      return;
    }
    res.status(500).json({ error: 'Failed to bind child' });
  }
};

export const getChildren = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'PARENT') {
      res.status(403).json({ error: 'For parents only' });
      return;
    }
    const relations = await prisma.userParent.findMany({
      where: { parentId: req.user.id },
      include: {
        child: { select: { id: true, name: true, email: true, phone: true } }
      }
    });
    res.json(relations.map(r => r.child));
  } catch {
    res.status(500).json({ error: 'Failed to fetch children' });
  }
};

export const unbindChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'PARENT') {
      res.status(403).json({ error: 'For parents only' });
      return;
    }
    const parentId = req.user.id;
    const { childId } = req.params;

    const relation = await prisma.userParent.findUnique({
      where: { parentId_childId: { parentId, childId } }
    });
    if (!relation) {
      res.status(404).json({ error: 'Child not linked to this parent' });
      return;
    }

    await prisma.userParent.delete({
      where: { parentId_childId: { parentId, childId } }
    });
    res.json({ message: 'Child unbound successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to unbind child' });
  }
};
