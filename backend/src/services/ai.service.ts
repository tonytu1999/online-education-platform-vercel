import prisma from '../config/prisma';
import { getSystemPrompt } from '../config/prompts';

interface AIServiceRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  subject?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type MentalHealthLabel = 'GOOD' | 'NEUTRAL' | 'BAD';
type MentalHealthPolarity = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
type MentalHealthRisk = 'LOW' | 'MEDIUM' | 'HIGH';

interface MentalHealthAnalysisInput {
  studentId: string;
  message: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

interface MentalHealthAnalysisOutput {
  scoreDelta: number;
  statusLabel: MentalHealthLabel;
  reasonSummary: string;
  signals: string[];
  emotionPolarity: MentalHealthPolarity;
  riskLevel: MentalHealthRisk;
}

interface OpenRouterCompletionInput {
  systemPrompt: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

const clampNumber = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const normalizeSignals = (signals: unknown): string[] => {
  if (!Array.isArray(signals)) {
    return [];
  }

  return [...new Set(signals.map((signal) => String(signal).trim()).filter((signal) => signal.length > 0))].slice(0, 6);
};

const classifyMentalHealth = (score: number): {
  statusLabel: MentalHealthLabel;
  emotionPolarity: MentalHealthPolarity;
  riskLevel: MentalHealthRisk;
} => {
  if (score >= 20) {
    return { statusLabel: 'GOOD', emotionPolarity: 'POSITIVE', riskLevel: 'LOW' };
  }

  if (score <= -20) {
    return { statusLabel: 'BAD', emotionPolarity: 'NEGATIVE', riskLevel: 'HIGH' };
  }

  return { statusLabel: 'NEUTRAL', emotionPolarity: 'NEUTRAL', riskLevel: 'MEDIUM' };
};

// Bag-of-words sentiment lexicon (score contribution per match)
const POSITIVE_WORDS: Record<string, number> = {
  happy: 0.8, glad: 0.7, joyful: 0.8, excited: 0.7, calm: 0.6, relaxed: 0.6,
  confident: 0.7, hopeful: 0.7, grateful: 0.7, supported: 0.6, understood: 0.6,
  better: 0.5, good: 0.5, great: 0.7, awesome: 0.8, fine: 0.4, okay: 0.3,
  rested: 0.5, steady: 0.5, encouraged: 0.6, relieved: 0.6, manageable: 0.5,
  'sleep well': 0.5, optimistic: 0.7, motivated: 0.7, proud: 0.7
};

const NEGATIVE_WORDS: Record<string, number> = {
  stressed: -0.7, anxious: -0.8, worried: -0.7, overwhelmed: -0.8, hopeless: -0.9,
  sad: -0.7, tired: -0.5, 'burned out': -0.8, burnout: -0.8, cry: -0.6,
  panic: -0.9, 'panic attack': -0.95, 'cannot sleep': -0.6, insomnia: -0.6,
  fail: -0.6, failure: -0.7, worthless: -0.9, alone: -0.7, 'self-harm': -1.0,
  suicide: -1.0, depressed: -0.9, frustrated: -0.6, angry: -0.6, scared: -0.7,
  lonely: -0.7, miserable: -0.8, exhausted: -0.6, drained: -0.6
};

// Compute sentiment score (-1 to 1) using bag-of-words on combined text
const computeSentimentScore = (texts: string[]): number => {
  const combined = texts.join(' ').toLowerCase();
  let total = 0;
  let count = 0;

  Object.entries(POSITIVE_WORDS).forEach(([word, weight]) => {
    if (combined.includes(word)) {
      total += weight;
      count += 1;
    }
  });

  Object.entries(NEGATIVE_WORDS).forEach(([word, weight]) => {
    if (combined.includes(word)) {
      total += weight;
      count += 1;
    }
  });

  if (count === 0) return 0;
  // Average and clamp to [-1, 1]
  return clampNumber(total / count, -1, 1);
};

// Analyze a session: average sentiment across all messages, map to scoreDelta
const analyzeSessionSentiment = (
  currentMessage: string,
  contextMessages: ChatMessage[]
): { scoreDelta: number; signals: string[]; reasonSummary: string } => {
  const allTexts = [currentMessage, ...contextMessages.map((m) => m.content)];
  const avgScore = computeSentimentScore(allTexts); // -1..1

  // Convert average (-1..1) to a delta suitable for accumulation (-10..10)
  const scoreDelta = clampNumber(Math.round(avgScore * 10), -10, 10);

  // Collect matched signals for transparency
  const combined = allTexts.join(' ').toLowerCase();
  const matched: string[] = [];
  [...Object.keys(POSITIVE_WORDS), ...Object.keys(NEGATIVE_WORDS)].forEach((w) => {
    if (combined.includes(w) && !matched.includes(w)) matched.push(w);
  });

  const reasonSummary = matched.length > 0
    ? `Session sentiment averaged ${avgScore.toFixed(2)} based on: ${matched.slice(0, 4).join(', ')}.`
    : 'No strong sentiment signals detected in the session; treated as neutral.';

  return { scoreDelta, signals: matched.slice(0, 6), reasonSummary };
};

const resolveChatSession = async (sessionId: string) => {
  const sessionById = await prisma.chatSession.findUnique({
    where: { id: sessionId }
  });

  if (sessionById) {
    return sessionById;
  }

  return prisma.chatSession.findUnique({
    where: { sessionId }
  });
};

const getLatestMentalHealthScore = async (studentId: string): Promise<number> => {
  const latest = await prisma.mentalHealth.findFirst({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    select: { statusScore: true }
  });

  return latest?.statusScore ?? 0;
};

const callOpenRouterCompletion = async (input: OpenRouterCompletionInput): Promise<string> => {
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

export const getActiveAIModel = async (): Promise<string> => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'ACTIVE_AI_MODEL' }
    });
    return config?.value || process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini';
  } catch (error) {
    return process.env.DEFAULT_AI_MODEL || 'gpt-4o-mini';
  }
};

// Get conversation history for context (last 10 messages)
export const getConversationHistory = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const messages = await prisma.chatHistory.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: -10, // Get last 10 messages
      select: { message: true, sender: true }
    });

    return messages.map(msg => ({
      role: msg.sender === 'USER' ? 'user' : 'assistant',
      content: msg.message
    }));
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
};

const callOpenRouter = async (req: AIServiceRequest): Promise<string> => {
  const conversationHistory = (req.conversationHistory || []) as Array<{ role: 'user' | 'assistant'; content: string }>;
  const messages: ChatMessage[] = [
    ...conversationHistory,
    { role: 'user' as const, content: req.message }
  ];

  // Get system prompt based on subject
  const systemPrompt = getSystemPrompt(req.subject);

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
  } catch (error) {
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
const getLocalSocraticResponse = (message: string, subject?: string): string => {
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

export const assessSessionMentalHealth = async (
  studentId: string,
  sessionId: string
): Promise<{
  sentimentScore: number;
  scoreDelta: number;
  currentScore: number;
  statusLabel: MentalHealthLabel;
  emotionPolarity: MentalHealthPolarity;
  riskLevel: MentalHealthRisk;
  signals: string[];
  reasonSummary: string;
  recordId: string;
}> => {
  const resolvedSession = await resolveChatSession(sessionId);
  if (!resolvedSession) throw new Error('Session not found');

  // Load ALL messages in the session (not capped)
  const rows = await prisma.chatHistory.findMany({
    where: { sessionId: resolvedSession.id },
    orderBy: { createdAt: 'asc' },
    select: { message: true }
  });

  const texts = rows.map((r) => r.message);
  const sentimentScore = computeSentimentScore(texts); // -1..1
  const scoreDelta = clampNumber(Math.round(sentimentScore * 10), -10, 10);

  const combined = texts.join(' ').toLowerCase();
  const matched: string[] = [];
  [...Object.keys(POSITIVE_WORDS), ...Object.keys(NEGATIVE_WORDS)].forEach((w) => {
    if (combined.includes(w) && !matched.includes(w)) matched.push(w);
  });

  const reasonSummary = matched.length > 0
    ? `Whole-session sentiment: ${sentimentScore.toFixed(2)} based on: ${matched.slice(0, 4).join(', ')}.`
    : 'No strong sentiment signals detected in the session; treated as neutral.';

  const currentScore = await getLatestMentalHealthScore(studentId);
  const nextScore = clampNumber(currentScore + scoreDelta, -100, 100);
  const scoreProfile = classifyMentalHealth(nextScore);
  const normalizedSignals = normalizeSignals(matched);

  const record = await prisma.mentalHealth.create({
    data: {
      studentId,
      sourceSessionId: resolvedSession.id,
      statusScore: nextScore,
      scoreDelta,
      statusLabel: scoreProfile.statusLabel,
      reasonSummary,
      signals: normalizedSignals.join(', '),
      emotionPolarity: scoreProfile.emotionPolarity,
      riskLevel: scoreProfile.riskLevel,
      keywords: normalizedSignals.join(', '),
      analysisModel: 'bow-sentiment-v1'
    }
  });

  return {
    sentimentScore,
    scoreDelta,
    currentScore: nextScore,
    ...scoreProfile,
    signals: normalizedSignals,
    reasonSummary,
    recordId: record.id
  };
};

export const assessMentalHealth = async (
  input: MentalHealthAnalysisInput
): Promise<MentalHealthAnalysisOutput & { currentScore: number; recordId: string; modelUsed: string }> => {
  const currentScore = await getLatestMentalHealthScore(input.studentId);
  const resolvedSession = input.sessionId ? await resolveChatSession(input.sessionId) : null;
  const recentConversation = resolvedSession ? await getConversationHistory(resolvedSession.id) : [];

  // Bag-of-words sentiment analysis over the whole session (current + history)
  const { scoreDelta, signals, reasonSummary } = analyzeSessionSentiment(input.message, recentConversation);

  const analysis: MentalHealthAnalysisOutput = {
    scoreDelta,
    ...classifyMentalHealth(currentScore + scoreDelta),
    reasonSummary,
    signals
  };

  const nextScore = clampNumber(currentScore + analysis.scoreDelta, -100, 100);
  const scoreProfile = classifyMentalHealth(nextScore);
  const normalizedSignals = normalizeSignals(analysis.signals);
  const record = await prisma.mentalHealth.create({
    data: {
      studentId: input.studentId,
      sourceSessionId: input.sessionId || null,
      statusScore: nextScore,
      scoreDelta: analysis.scoreDelta,
      statusLabel: analysis.statusLabel || scoreProfile.statusLabel,
      reasonSummary: analysis.reasonSummary,
      signals: normalizedSignals.join(', '),
      emotionPolarity: analysis.emotionPolarity || scoreProfile.emotionPolarity,
      riskLevel: analysis.riskLevel || scoreProfile.riskLevel,
      keywords: normalizedSignals.join(', '),
      analysisModel: 'bow-sentiment-v1'
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
    modelUsed: 'bow-sentiment-v1'
  };
};

// Claude API call (placeholder)
const callClaude = async (req: AIServiceRequest): Promise<string> => {
  console.log('Claude integration not yet implemented');
  return `[Claude] Socratic response to: "${req.message}". Why do you think that happens?`;
};

// OpenAI API call (placeholder)
const callOpenAI = async (req: AIServiceRequest): Promise<string> => {
  console.log('OpenAI integration not yet implemented');
  return `[OpenAI] Socratic response to: "${req.message}". What is the logical next step?`;
};

// DeepSeek API call (placeholder)
const callDeepSeek = async (req: AIServiceRequest): Promise<string> => {
  console.log('DeepSeek integration not yet implemented');
  return `[DeepSeek] Socratic response to: "${req.message}". How does this connect to what we learned?`;
};

export const generateSocraticResponse = async (
  userMessage: string,
  sessionId?: string
): Promise<{ response: string; model: string }> => {
  const activeModel = await getActiveAIModel();

  // Get conversation history and subject if sessionId provided
  let conversationHistory: ChatMessage[] = [];
  let subject: string | undefined = undefined;
  
  if (sessionId) {
    try {
      const session = await resolveChatSession(sessionId);
      if (session) {
        conversationHistory = await getConversationHistory(session.id);
        subject = session.subject || undefined;
        console.log('[AI Service] Session subject:', subject);
      }
    } catch (error) {
      console.error('Error getting session details:', error);
    }
  }

  const req: AIServiceRequest = {
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
  } catch (error) {
    console.error('AI generation failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }

  return { response, model: activeModel };
};
