"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSocraticResponse = exports.assessMentalHealth = exports.getConversationHistory = exports.getActiveAIModel = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const prompts_1 = require("../config/prompts");
const MENTAL_HEALTH_CONFIG_KEY = 'MENTAL_HEALTH_SYSTEM_PROMPT';
const clampNumber = (value, min, max) => Math.min(max, Math.max(min, value));
const normalizeSignals = (signals) => {
    if (!Array.isArray(signals)) {
        return [];
    }
    return [...new Set(signals.map((signal) => String(signal).trim()).filter((signal) => signal.length > 0))].slice(0, 6);
};
const classifyMentalHealth = (score) => {
    if (score >= 20) {
        return { statusLabel: 'GOOD', emotionPolarity: 'POSITIVE', riskLevel: 'LOW' };
    }
    if (score <= -20) {
        return { statusLabel: 'BAD', emotionPolarity: 'NEGATIVE', riskLevel: 'HIGH' };
    }
    return { statusLabel: 'NEUTRAL', emotionPolarity: 'NEUTRAL', riskLevel: 'MEDIUM' };
};
const parseJsonFromModel = (raw) => {
    const trimmed = raw.trim();
    const stripped = trimmed
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '');
    const firstBrace = stripped.indexOf('{');
    const lastBrace = stripped.lastIndexOf('}');
    const candidate = firstBrace >= 0 && lastBrace >= 0
        ? stripped.slice(firstBrace, lastBrace + 1)
        : stripped;
    try {
        return JSON.parse(candidate);
    }
    catch {
        return null;
    }
};
const keywordBasedMentalHealthFallback = (message, contextMessages) => {
    const combinedText = [message, ...contextMessages.map((entry) => entry.content)].join(' ').toLowerCase();
    const positiveSignals = [
        'calm', 'happy', 'better', 'supported', 'confident', 'relieved', 'hopeful', 'manageable', 'understood', 'grateful',
        'sleep well', 'rested', 'steady', 'encouraged', 'okay', 'fine'
    ];
    const negativeSignals = [
        'stressed', 'anxious', 'worried', 'overwhelmed', 'hopeless', 'tired', 'burned out', 'burnout', 'cry', 'sad',
        'panic', 'panic attack', 'cannot sleep', 'insomnia', 'fail', 'failure', 'worthless', 'alone', 'self-harm', 'suicide'
    ];
    const matchedSignals = [];
    let scoreDelta = 0;
    positiveSignals.forEach((signal) => {
        if (combinedText.includes(signal)) {
            matchedSignals.push(signal);
            scoreDelta += signal.includes('sleep') || signal.includes('rested') ? 2 : 3;
        }
    });
    negativeSignals.forEach((signal) => {
        if (combinedText.includes(signal)) {
            matchedSignals.push(signal);
            scoreDelta -= signal === 'self-harm' || signal === 'suicide' ? 8 : signal.includes('panic') ? 6 : 3;
        }
    });
    scoreDelta = clampNumber(scoreDelta, -10, 10);
    const reasonSummary = matchedSignals.length > 0
        ? `The student mentioned ${matchedSignals.slice(0, 3).join(', ')}, which suggests the current wellbeing trend is changing.`
        : 'The student message did not include strong positive or negative wellbeing signals, so the status is treated as neutral.';
    return {
        scoreDelta,
        ...classifyMentalHealth(scoreDelta),
        reasonSummary,
        signals: matchedSignals.slice(0, 6)
    };
};
const resolveChatSession = async (sessionId) => {
    const sessionById = await prisma_1.default.chatSession.findUnique({
        where: { id: sessionId }
    });
    if (sessionById) {
        return sessionById;
    }
    return prisma_1.default.chatSession.findUnique({
        where: { sessionId }
    });
};
const getLatestMentalHealthScore = async (studentId) => {
    const latest = await prisma_1.default.mentalHealth.findFirst({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        select: { statusScore: true }
    });
    return latest?.statusScore ?? 0;
};
const getMentalHealthPrompt = async () => {
    try {
        const config = await prisma_1.default.systemConfig.findUnique({
            where: { key: MENTAL_HEALTH_CONFIG_KEY }
        });
        return config?.value || (0, prompts_1.getMentalHealthSystemPrompt)();
    }
    catch (error) {
        return (0, prompts_1.getMentalHealthSystemPrompt)();
    }
};
const callOpenRouterCompletion = async (input) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://api.openrouter.ai/api/v1';
    const model = process.env.OPENROUTER_SOCRATIC_MODEL || 'gpt-4o-mini';
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY not configured');
    }
    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Online Education Platform'
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: input.systemPrompt },
                ...input.messages
            ],
            temperature: input.temperature ?? 0.7,
            max_tokens: input.maxTokens ?? 500
        })
    });
    if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            body: error
        });
        throw new Error(`OpenRouter API failed with status ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
};
const getActiveAIModel = async () => {
    try {
        const config = await prisma_1.default.systemConfig.findUnique({
            where: { key: 'ACTIVE_AI_MODEL' }
        });
        return config?.value || process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini';
    }
    catch (error) {
        return process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini';
    }
};
exports.getActiveAIModel = getActiveAIModel;
// Get conversation history for context (last 10 messages)
const getConversationHistory = async (sessionId) => {
    try {
        const messages = await prisma_1.default.chatHistory.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
            take: -10, // Get last 10 messages
            select: { message: true, sender: true }
        });
        return messages.map(msg => ({
            role: msg.sender === 'USER' ? 'user' : 'assistant',
            content: msg.message
        }));
    }
    catch (error) {
        console.error('Error fetching conversation history:', error);
        return [];
    }
};
exports.getConversationHistory = getConversationHistory;
const callOpenRouter = async (req) => {
    const conversationHistory = (req.conversationHistory || []);
    const messages = [
        ...conversationHistory,
        { role: 'user', content: req.message }
    ];
    // Get system prompt based on subject
    const systemPrompt = (0, prompts_1.getSystemPrompt)(req.subject);
    try {
        console.log(`[AI Service] Calling OpenRouter with model: ${process.env.OPENROUTER_SOCRATIC_MODEL || 'gpt-4o-mini'}, subject: ${req.subject || 'default'}`);
        const aiResponse = await callOpenRouterCompletion({
            systemPrompt,
            messages,
            temperature: 0.7,
            maxTokens: 500
        }) || 'I apologize, I could not generate a response.';
        console.log('[AI Service] OpenRouter response received successfully');
        return aiResponse;
    }
    catch (error) {
        console.error('OpenRouter call failed:', {
            error: error instanceof Error ? error.message : error,
            timestamp: new Date().toISOString()
        });
        // Fallback: Return a demo response for testing
        console.log('[AI Service] Using demo/fallback response (network error)');
        return getLocalSocraticResponse(req.message, req.subject);
    }
};
// Local/demo Socratic response generator for when API is unavailable
const getLocalSocraticResponse = (message, subject) => {
    const responses = {
        mathematics: [
            "That's an interesting question about mathematics. Let me ask you back: What mathematical operations or concepts do you think might be involved here?",
            "I see you're working on a math problem. Before I help, can you tell me what you've already tried?",
            "In mathematics, it's important to understand the 'why' behind the answer. What do you think the first step should be?"
        ],
        science: [
            "That's a great scientific question! What do you already know about this topic that might help us explore it?",
            "In science, we often test ideas through observation. What could we observe to understand this better?",
            "Before I explain, can you tell me what you think might happen and why?"
        ],
        language_arts: [
            "That's an interesting literary question. What textual evidence can you find to support your thinking?",
            "Let's analyze this together. What specific words or phrases from the text stand out to you?",
            "Before drawing a conclusion, what do you notice about the author's word choices here?"
        ],
        default: [
            "That's a great question! What do you already know about this topic?",
            "I'm here to help you think through this. What's your initial thought on this?",
            "Let me ask you: What do you think the answer might be, and what makes you think that?",
            "I notice you're curious about that. Can you break this down into smaller parts?",
            "That's an interesting question! What connections can you make to things you already know?"
        ]
    };
    const subjectResponses = subject && subject.toLowerCase().includes('math') ? responses.mathematics
        : subject && subject.toLowerCase().includes('science') ? responses.science
            : subject && subject.toLowerCase().includes('english') ? responses.language_arts
                : responses.default;
    const randomIdx = Math.floor(Math.random() * subjectResponses.length);
    return subjectResponses[randomIdx];
};
const assessMentalHealth = async (input) => {
    const currentScore = await getLatestMentalHealthScore(input.studentId);
    const resolvedSession = input.sessionId ? await resolveChatSession(input.sessionId) : null;
    const recentConversation = resolvedSession ? await (0, exports.getConversationHistory)(resolvedSession.id) : [];
    const systemPrompt = await getMentalHealthPrompt();
    const modelUsed = process.env.OPENROUTER_SOCRATIC_MODEL || 'gpt-4o-mini';
    const promptPayload = {
        currentScore,
        studentMessage: input.message,
        context: input.context || {},
        recentConversation: recentConversation.slice(-6)
    };
    let analysis = null;
    try {
        const modelResponse = await callOpenRouterCompletion({
            systemPrompt,
            messages: [{ role: 'user', content: JSON.stringify(promptPayload) }],
            temperature: 0.2,
            maxTokens: 320
        });
        const parsed = parseJsonFromModel(modelResponse);
        if (parsed && typeof parsed.scoreDelta === 'number') {
            const scoreDelta = clampNumber(Math.trunc(parsed.scoreDelta), -10, 10);
            const classified = classifyMentalHealth(currentScore + scoreDelta);
            analysis = {
                scoreDelta,
                statusLabel: parsed.statusLabel && ['GOOD', 'NEUTRAL', 'BAD'].includes(parsed.statusLabel)
                    ? parsed.statusLabel
                    : classified.statusLabel,
                reasonSummary: typeof parsed.reasonSummary === 'string' && parsed.reasonSummary.trim().length > 0
                    ? parsed.reasonSummary.trim()
                    : 'The model returned a partial mental-health assessment without a reason summary.',
                signals: normalizeSignals(parsed.signals),
                emotionPolarity: parsed.emotionPolarity && ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(parsed.emotionPolarity)
                    ? parsed.emotionPolarity
                    : classified.emotionPolarity,
                riskLevel: parsed.riskLevel && ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.riskLevel)
                    ? parsed.riskLevel
                    : classified.riskLevel
            };
        }
    }
    catch (error) {
        console.warn('[AI Service] Mental health model analysis failed, falling back to local heuristic', error);
    }
    if (!analysis) {
        analysis = keywordBasedMentalHealthFallback(input.message, recentConversation);
    }
    const nextScore = clampNumber(currentScore + analysis.scoreDelta, -100, 100);
    const scoreProfile = classifyMentalHealth(nextScore);
    const signals = normalizeSignals(analysis.signals);
    const record = await prisma_1.default.mentalHealth.create({
        data: {
            studentId: input.studentId,
            sourceSessionId: input.sessionId || null,
            statusScore: nextScore,
            scoreDelta: analysis.scoreDelta,
            statusLabel: analysis.statusLabel || scoreProfile.statusLabel,
            reasonSummary: analysis.reasonSummary,
            signals: signals.join(', '),
            emotionPolarity: analysis.emotionPolarity || scoreProfile.emotionPolarity,
            riskLevel: analysis.riskLevel || scoreProfile.riskLevel,
            keywords: signals.join(', '),
            analysisModel: modelUsed
        }
    });
    return {
        ...scoreProfile,
        ...analysis,
        scoreDelta: analysis.scoreDelta,
        statusLabel: analysis.statusLabel || scoreProfile.statusLabel,
        emotionPolarity: analysis.emotionPolarity || scoreProfile.emotionPolarity,
        riskLevel: analysis.riskLevel || scoreProfile.riskLevel,
        currentScore: nextScore,
        recordId: record.id,
        modelUsed
    };
};
exports.assessMentalHealth = assessMentalHealth;
// Claude API call (placeholder)
const callClaude = async (req) => {
    console.log('Claude integration not yet implemented');
    return `[Claude] Socratic response to: "${req.message}". Why do you think that happens?`;
};
// OpenAI API call (placeholder)
const callOpenAI = async (req) => {
    console.log('OpenAI integration not yet implemented');
    return `[OpenAI] Socratic response to: "${req.message}". What is the logical next step?`;
};
// DeepSeek API call (placeholder)
const callDeepSeek = async (req) => {
    console.log('DeepSeek integration not yet implemented');
    return `[DeepSeek] Socratic response to: "${req.message}". How does this connect to what we learned?`;
};
const generateSocraticResponse = async (userMessage, sessionId) => {
    const activeModel = await (0, exports.getActiveAIModel)();
    // Get conversation history and subject if sessionId provided
    let conversationHistory = [];
    let subject = undefined;
    if (sessionId) {
        try {
            const session = await resolveChatSession(sessionId);
            if (session) {
                conversationHistory = await (0, exports.getConversationHistory)(session.id);
                subject = session.subject || undefined;
                console.log('[AI Service] Session subject:', subject);
            }
        }
        catch (error) {
            console.error('Error getting session details:', error);
        }
    }
    const req = {
        message: userMessage,
        conversationHistory,
        subject
    };
    let response = '';
    try {
        console.log('[AI Service] Generating response with model:', activeModel);
        switch (activeModel.toLowerCase()) {
            case 'openrouter':
            case 'gpt-4o-mini':
            case 'claude':
                response = await callOpenRouter(req);
                break;
            case 'openai':
                response = await callOpenAI(req);
                break;
            case 'deepseek':
                response = await callDeepSeek(req);
                break;
            default:
                response = await callOpenRouter(req);
                break;
        }
        if (!response) {
            throw new Error('No response generated from AI service');
        }
        console.log('[AI Service] Response generated successfully, length:', response.length);
    }
    catch (error) {
        console.error('AI generation failed:', {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
    return { response, model: activeModel };
};
exports.generateSocraticResponse = generateSocraticResponse;
