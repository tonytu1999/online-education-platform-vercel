import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateSocraticResponse } from '../services/ai.service';
import { isMessageForbidden } from '../services/filter.service';
import prisma from '../config/prisma';

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, message, context } = req.body;
    
    // 1. Prohibited Topic Filter
    const isForbidden = await isMessageForbidden(message);
    if (isForbidden) {
      res.status(403).json({ error: 'Message contains prohibited content and has been blocked.' });
      return;
    }

    // Save user message
    await prisma.chatHistory.create({
      data: { studentId, message, sender: 'USER' }
    });

    // 2. Generate Socratic Response using actively configured AI Model
    const { response: aiResponse, model } = await generateSocraticResponse(message, context);
    
    // Save AI response
    await prisma.chatHistory.create({
      data: { studentId, message: aiResponse, sender: 'AI', modelUsed: model }
    });

    res.json({ response: aiResponse, modelUsed: model });
  } catch (error) {
    res.status(500).json({ error: 'AI processing failed' });
  }
};

export const checkMentalHealth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Placeholder mental health analysis - in MVP we return a safe default
    res.json({ emotionPolarity: 'NEUTRAL', riskLevel: 'LOW', keywords: [] });
  } catch (error: any) {
    res.status(500).json({ error: 'Mental health check failed' });
  }
};
