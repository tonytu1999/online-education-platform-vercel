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

    const students = await prisma.classStudent.findMany({
      where: { classId },
      include: {
        student: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    // Cast needed because TS sometimes doesn't catch select expansions correctly internally with map
    res.json(students.map((s: any) => s.student));
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
