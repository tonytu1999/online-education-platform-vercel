import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { assessMentalHealth, assessSessionMentalHealth, analyzeLearningBehavior, generateSocraticResponse, generateMentalHealthResponse } from '../services/ai.service';
import { isResponseForbidden } from '../services/filter.service';
import prisma from '../config/prisma';

const SESSION_TYPES = ['Socratic', 'Mental'] as const;
type SessionTypeInput = typeof SESSION_TYPES[number];

// Create a new chat session
export const createChatSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const { type, systemPrompt, subject, topic } = req.body;

    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!SESSION_TYPES.includes(type as SessionTypeInput)) {
      res.status(400).json({ error: 'type must be "Socratic" or "Mental"' });
      return;
    }

    const sessionType = type === 'Mental' ? 'MENTAL' : 'SOCRATIC';

    const session = await (prisma.chatSession.create as any)({
      data: {
        studentId,
        sessionType,
        ...(systemPrompt && typeof systemPrompt === 'string' ? { systemPrompt } : {}),
        ...(subject && typeof subject === 'string' ? { subject: subject.trim() } : {}),
        ...(topic && typeof topic === 'string' ? { topic: topic.trim() } : {})
      }
    });

    res.status(201).json({ session });
  } catch (error: any) {
    console.error('Create session failed:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
};

// Get all sessions for a student
export const getStudentSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const sessions = await prisma.chatSession.findMany({
      where: { studentId },
      include: {
        chatHistories: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { lastAccessedAt: 'desc' }
    });

    res.json({ sessions });
  } catch (error: any) {
    console.error('Get sessions failed:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// Get session details with conversation history
export const getSessionDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = Array.isArray(req.params.sessionId) 
      ? req.params.sessionId[0] 
      : req.params.sessionId;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

      const session = await prisma.chatSession.findFirst({
        where: {
          OR: [
            { id: sessionId },
            { sessionId }
          ]
        },
        include: { chatHistories: { orderBy: { createdAt: 'asc' } } }
      });

    if (!session || session.studentId !== studentId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ session });
  } catch (error: any) {
    console.error('Get session details failed:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
};

// Send message in a chat session with memory
export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  console.warn('[CHAT] WARNING LOG - Handler starting');
  console.error('[CHAT] ERROR LOG - Handler starting');
  try {
    console.warn('[CHAT] In try block');
    const { sessionId, message } = req.body;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!sessionId || !message) {
      res.status(400).json({ error: 'sessionId and message are required' });
      return;
    }

    // Verify session belongs to student
    // Cast includes sessionType — regenerate the Prisma client (`npx prisma generate`) to remove this cast
    const session = await prisma.chatSession.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { sessionId }
        ]
      }
    }) as (Awaited<ReturnType<typeof prisma.chatSession.findFirst>> & { sessionType: string; systemPrompt: string | null }) | null;

    if (!session || session.studentId !== studentId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Check if this is the first user message (for Socratic title generation)
    const isSocratic = session.sessionType === 'SOCRATIC';
    const priorUserCount = isSocratic
      ? await prisma.chatHistory.count({ where: { sessionId: session.id, sender: 'USER' } })
      : 1;
    const isFirstMessage = priorUserCount === 0;

    console.warn('[CHAT] About to generate AI response, type:', session.sessionType);

    // Generate response BEFORE saving the user message so that getConversationHistory
    // fetches only prior turns, preventing the current message from appearing twice.
    // System prompt is read from the session directly inside each service function.
    let { response: aiResponse, model } = isSocratic
      ? await generateSocraticResponse(message, session.id)
      : await generateMentalHealthResponse(message, session.id);

    console.warn('[CHAT] Generated response');

    // Save user message — user input is never blocked so students can always express themselves
    await prisma.chatHistory.create({
      data: {
        sessionId: session.id,
        studentId,
        message,
        sender: 'USER'
      }
    });

    // Filter AI response — replace with a safe message if it contains forbidden content
    if (await isResponseForbidden(aiResponse)) {
      aiResponse = "I'm here for you and I want to make sure you're safe. Please reach out to a trusted adult, school counsellor, or a crisis helpline — you don't have to face this alone.";
    }

    // Save AI response
    await prisma.chatHistory.create({
      data: {
        sessionId: session.id,
        studentId,
        message: aiResponse,
        sender: 'AI',
        modelUsed: model
      }
    });

    // Derive title from first user message in a Socratic session
    const derivedTitle = isFirstMessage
      ? (message.length > 60 ? message.slice(0, 60).trimEnd() + '...' : message.trim())
      : undefined;

    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        lastAccessedAt: new Date(),
        ...(derivedTitle ? { title: derivedTitle } : {})
      }
    });

    // 3. Learning behaviour analysis — Socratic sessions only (fire-and-forget)
    if (isSocratic) {
      analyzeLearningBehavior(studentId, session.id).catch(() => {});
    }

    // 4. Mental health analysis — runs for all session types
    let mentalHealth = null;
    try {
      mentalHealth = await assessMentalHealth({
        studentId,
        sessionId: session.id,
        message,
        context: {
          source: 'chat',
          subject: session.subject,
          topic: session.topic
        }
      });
    } catch (mentalHealthError) {
      console.error('[CHAT] Mental health analysis failed:', mentalHealthError);
    }

    console.warn('[CHAT] About to send response');
    res.json({
      response: aiResponse,
      modelUsed: model,
      sessionId,
      mentalHealth
    });
  } catch (error: any) {
    console.log('[CHAT] ===== CAUGHT ERROR IN CATCH BLOCK =====');
    console.error('[CHAT] Full error object:', error);
    console.error('[CHAT] Error message:', error?.message);
    console.error('[CHAT] Error stack:', error?.stack);
    res.status(500).json({ error: error?.message || 'AI processing failed' });
  }
};

// Delete a chat session
export const deleteChatSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = Array.isArray(req.params.sessionId) 
      ? req.params.sessionId[0] 
      : req.params.sessionId;
    const studentId = req.user?.id;

    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

      const session = await prisma.chatSession.findFirst({
        where: {
          OR: [
            { id: sessionId },
            { sessionId }
          ]
        }
      });

    if (!session || session.studentId !== studentId) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    await prisma.chatSession.delete({
      where: { id: session.id }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    console.error('Delete session failed:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

export const checkMentalHealth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const message = (req.body?.message || req.body?.text || '').toString().trim();
    const sessionId = (req.body?.sessionId || req.body?.chatSessionId || '').toString().trim() || undefined;
    const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};

    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!message) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const assessment = await assessMentalHealth({
      studentId,
      sessionId,
      message,
      context
    });

    res.json(assessment);
  } catch (error: any) {
    console.error('[MENTAL HEALTH] Error:', error?.message, error?.stack);
    res.status(500).json({ error: 'Mental health check failed', details: error?.message });
  }
};

export const getMentalHealthHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const caller = req.user;
    if (!caller) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Teachers and admins may pass ?studentId= to view another student's history
    const isPrivileged = caller.role === 'TEACHER' || caller.role === 'SCHOOL_ADMIN';
    const requestedId = req.query.studentId as string | undefined;
    if (requestedId && !isPrivileged) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const studentId = (isPrivileged && requestedId) ? requestedId : caller.id;

    const sessionId = req.query.sessionId as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || '100', 10), 500);

    const records = await prisma.mentalHealth.findMany({
      where: {
        studentId,
        ...(sessionId ? { sourceSessionId: sessionId } : {})
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: {
        id: true,
        scoreDelta: true,
        statusScore: true,
        statusLabel: true,
        riskLevel: true,
        emotionPolarity: true,
        signals: true,
        createdAt: true,
        sourceSessionId: true
      }
    });

    const history = records.map(r => ({
      ...r,
      signals: r.signals ? r.signals.split(',').map((s: string) => s.trim()).filter(Boolean) : []
    }));

    res.json({ history });
  } catch (error: any) {
    console.error('[MENTAL HEALTH HISTORY] Error:', error?.message);
    res.status(500).json({ error: 'Failed to fetch mental health history' });
  }
};

export const checkSessionMentalHealth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?.id;
    const sessionId = Array.isArray(req.params.sessionId)
      ? req.params.sessionId[0]
      : req.params.sessionId;

    if (!studentId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const result = await assessSessionMentalHealth(studentId, sessionId);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Session not found') {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    res.status(500).json({ error: 'Mental health analysis failed' });
  }
};
