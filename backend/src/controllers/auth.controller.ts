import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Register request received', req.body);

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : undefined;
    const phone = typeof req.body.phone === 'string' && req.body.phone.trim() !== '' ? req.body.phone.trim() : undefined;
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!name || !email || !password) {
      console.warn('Register validation failed', { name, email, phone });
      res.status(400).json({ error: 'name, email, and password are required' });
      return;
    }

    const existingEmailUser = await prisma.user.findUnique({ where: { email } });
    if (existingEmailUser) {
      console.warn('Register blocked: email already exists', { email });
      res.status(409).json({ error: 'Email already exists', field: 'email' });
      return;
    }

    if (phone) {
      const existingPhoneUser = await prisma.user.findUnique({ where: { phone } });
      if (existingPhoneUser) {
        console.warn('Register blocked: phone already exists', { phone });
        res.status(409).json({ error: 'Phone already exists', field: 'phone' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword
      }
    });

    console.log('Register success', { userId: user.id, email, phone });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    const prismaError = error as {
      code?: string;
      message?: string;
      stack?: string;
      meta?: unknown;
    };

    console.error('Register error object:', error);
    console.error('Register error stack:', prismaError.stack || 'No stack available');

    if (prismaError.code === 'P2002') {
      res.status(409).json({ error: 'Email or phone already exists' });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      code: prismaError.code,
      details: prismaError.message || 'Unknown error',
      stack: prismaError.stack || undefined,
      meta: prismaError.meta || undefined
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Login request received', req.body);

    const { email, phone, password } = req.body;

    if (!email && !phone) {
      res.status(400).json({ error: 'Email or phone is required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    console.log('Login success', { userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    const authError = error as {
      code?: string;
      message?: string;
      stack?: string;
      meta?: unknown;
    };

    console.error('Login error object:', error);
    console.error('Login error stack:', authError.stack || 'No stack available');

    res.status(500).json({
      error: 'Internal server error',
      code: authError.code,
      details: authError.message || 'Unknown error',
      stack: authError.stack || undefined,
      meta: authError.meta || undefined
    });
  }
};

const VALID_ROLES = ['STUDENT', 'PARENT', 'TEACHER', 'SCHOOL_ADMIN'] as const;

export const selectRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = typeof req.body.userId === 'string' ? req.body.userId.trim() : '';
    const role = typeof req.body.role === 'string' ? req.body.role.trim() : '';

    if (!userId || !role) {
      res.status(400).json({ error: 'userId and role are required' });
      return;
    }

    if (!VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
      res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: role as typeof VALID_ROLES[number] }
    });

    console.log('Role selected', { userId, role });
    res.json({ message: 'Role updated successfully', userId, role });
  } catch (error) {
    console.error('selectRole error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
