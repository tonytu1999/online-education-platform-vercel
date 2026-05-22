import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const createSchool = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, code } = req.body;
    const school = await prisma.school.create({
      data: { name, code }
    });
    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create school' });
  }
};

export const getSchools = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schools = await prisma.school.findMany({
      select: { id: true, name: true, code: true }
    });
    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
};
