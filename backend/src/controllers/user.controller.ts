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

export const bindChild = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'PARENT') {
      res.status(403).json({ error: 'Fors parents only' });
      return;
    }
    const { childId } = req.body;
    const parentId = req.user.id;

    await prisma.userParent.create({
      data: { parentId, childId }
    });

    res.json({ message: 'Child bound successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bind child' });
  }
};
