"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSessionMentalHealth = exports.checkMentalHealth = exports.deleteChatSession = exports.chat = exports.getSessionDetails = exports.getStudentSessions = exports.createChatSession = void 0;
const ai_service_1 = require("../services/ai.service");
const filter_service_1 = require("../services/filter.service");
const prisma_1 = __importDefault(require("../config/prisma"));
const SESSION_TYPES = ['Socratic', 'Mental'];
// Create a new chat session
const createChatSession = async (req, res) => {
    try {
        const studentId = req.user?.id;
        const { type } = req.body;
        if (!studentId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        if (!SESSION_TYPES.includes(type)) {
            res.status(400).json({ error: 'type must be "Socratic" or "Mental"' });
            return;
        }
        const sessionType = type === 'Mental' ? 'MENTAL' : 'SOCRATIC';
        const session = await prisma_1.default.chatSession.create({
            data: {
                studentId,
                sessionType
            }
        });
        res.status(201).json({ session });
    }
    catch (error) {
        console.error('Create session failed:', error);
        res.status(500).json({ error: 'Failed to create chat session' });
    }
};
exports.createChatSession = createChatSession;
// Get all sessions for a student
const getStudentSessions = async (req, res) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const sessions = await prisma_1.default.chatSession.findMany({
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
    }
    catch (error) {
        console.error('Get sessions failed:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
};
exports.getStudentSessions = getStudentSessions;
// Get session details with conversation history
const getSessionDetails = async (req, res) => {
    try {
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const session = await prisma_1.default.chatSession.findFirst({
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
    }
    catch (error) {
        console.error('Get session details failed:', error);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
};
exports.getSessionDetails = getSessionDetails;
// Send message in a chat session with memory
const chat = async (req, res) => {
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
        const session = await prisma_1.default.chatSession.findFirst({
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
        // 1. Prohibited Topic Filter
        console.warn('[CHAT] About to check forbidden');
        const isForbidden = await (0, filter_service_1.isMessageForbidden)(message);
        if (isForbidden) {
            res.status(403).json({ error: 'Message contains prohibited content and has been blocked.' });
            return;
        }
        // Check if this is the first user message (for Socratic title generation)
        const isSocratic = session.sessionType === 'SOCRATIC';
        const priorUserCount = isSocratic
            ? await prisma_1.default.chatHistory.count({ where: { sessionId: session.id, sender: 'USER' } })
            : 1;
        const isFirstMessage = priorUserCount === 0;
        // Save user message
        console.warn('[CHAT] About to save user message');
        await prisma_1.default.chatHistory.create({
            data: {
                sessionId: session.id,
                studentId,
                message,
                sender: 'USER'
            }
        });
        console.warn('[CHAT] About to generate AI response, type:', session.sessionType);
        // 2. Generate response based on session type
        const { response: aiResponse, model } = isSocratic
            ? await (0, ai_service_1.generateSocraticResponse)(message, session.id)
            : await (0, ai_service_1.generateMentalHealthResponse)(message, session.id);
        console.warn('[CHAT] Generated response');
        // Save AI response
        await prisma_1.default.chatHistory.create({
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
        await prisma_1.default.chatSession.update({
            where: { id: session.id },
            data: {
                lastAccessedAt: new Date(),
                ...(derivedTitle ? { title: derivedTitle } : {})
            }
        });
        // 3. Mental health analysis — Socratic sessions only
        let mentalHealth = null;
        if (isSocratic) {
            try {
                mentalHealth = await (0, ai_service_1.assessMentalHealth)({
                    studentId,
                    sessionId: session.id,
                    message,
                    context: {
                        source: 'chat',
                        subject: session.subject,
                        topic: session.topic
                    }
                });
            }
            catch (mentalHealthError) {
                console.error('[CHAT] Mental health analysis failed:', mentalHealthError);
            }
        }
        console.warn('[CHAT] About to send response');
        res.json({
            response: aiResponse,
            modelUsed: model,
            sessionId,
            mentalHealth
        });
    }
    catch (error) {
        console.log('[CHAT] ===== CAUGHT ERROR IN CATCH BLOCK =====');
        console.error('[CHAT] Full error object:', error);
        console.error('[CHAT] Error message:', error?.message);
        console.error('[CHAT] Error stack:', error?.stack);
        res.status(500).json({ error: error?.message || 'AI processing failed' });
    }
};
exports.chat = chat;
// Delete a chat session
const deleteChatSession = async (req, res) => {
    try {
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        const studentId = req.user?.id;
        if (!studentId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const session = await prisma_1.default.chatSession.findFirst({
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
        await prisma_1.default.chatSession.delete({
            where: { id: session.id }
        });
        res.json({ message: 'Session deleted successfully' });
    }
    catch (error) {
        console.error('Delete session failed:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
};
exports.deleteChatSession = deleteChatSession;
const checkMentalHealth = async (req, res) => {
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
        const assessment = await (0, ai_service_1.assessMentalHealth)({
            studentId,
            sessionId,
            message,
            context
        });
        res.json(assessment);
    }
    catch (error) {
        console.error('[MENTAL HEALTH] Error:', error?.message, error?.stack);
        res.status(500).json({ error: 'Mental health check failed', details: error?.message });
    }
};
exports.checkMentalHealth = checkMentalHealth;
const checkSessionMentalHealth = async (req, res) => {
    try {
        const studentId = req.user?.id;
        const sessionId = Array.isArray(req.params.sessionId)
            ? req.params.sessionId[0]
            : req.params.sessionId;
        if (!studentId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const result = await (0, ai_service_1.assessSessionMentalHealth)(studentId, sessionId);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'Session not found') {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        res.status(500).json({ error: 'Mental health analysis failed' });
    }
};
exports.checkSessionMentalHealth = checkSessionMentalHealth;
