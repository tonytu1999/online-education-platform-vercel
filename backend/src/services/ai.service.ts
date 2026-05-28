import Sentiment from 'sentiment';
import { MasteryLevel } from '@prisma/client';
import prisma from '../config/prisma';
import { getSystemPrompt, getMentalChatSystemPrompt, getLearningAnalysisPrompt } from '../config/prompts';

interface AIServiceRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  subject?: string;
  customSystemPrompt?: string;
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

// Classify the current message sentiment by its delta (-10..10)
const classifyDelta = (delta: number): {
  statusLabel: MentalHealthLabel;
  emotionPolarity: MentalHealthPolarity;
  riskLevel: MentalHealthRisk;
} => {
  if (delta >= 4) {
    return { statusLabel: 'GOOD', emotionPolarity: 'POSITIVE', riskLevel: 'LOW' };
  }
  if (delta <= -4) {
    return { statusLabel: 'BAD', emotionPolarity: 'NEGATIVE', riskLevel: 'HIGH' };
  }
  return { statusLabel: 'NEUTRAL', emotionPolarity: 'NEUTRAL', riskLevel: 'MEDIUM' };
};

// Classify the accumulated score trend (-100..100)
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

const sentimentAnalyzer = new Sentiment();

// Single-word extras not in AFINN-165 (scores on the same -5..5 scale)
const ACADEMIC_EXTRAS: Record<string, number> = {
  punish: -4, punished: -4, scolded: -3, overwhelm: -3,
  struggling: -3, failing: -3, burnout: -4,
  insomnia: -3, exhausted: -3, drained: -2,
  humiliated: -4, ashamed: -3, embarrassed: -2,
  disappointed: -3, disappoint: -2,
  suicide: -5,
  motivated: 3, determined: 3, resilient: 3,
  productive: 2, improved: 2, progress: 2,
  succeed: 3, focused: 2, curious: 2
};

// Bigram / trigram dictionary — phrases whose meaning differs from the sum of their parts.
// Scores use the same -5..5 AFINN scale.
const PHRASE_SCORES: Record<string, number> = {
  // Negation patterns
  'cannot sleep': -3, "can't sleep": -3,
  'cannot sleep well': -4, "can't sleep well": -4,
  'cannot focus': -3, "can't focus": -3,
  'cannot concentrate': -3, "can't concentrate": -3,
  'cannot eat': -2, "can't eat": -2,
  'cannot stop crying': -5, "can't stop crying": -5,
  'cannot do this': -3, "can't do this": -3,
  'cannot cope': -4, "can't cope": -4,
  'no motivation': -3, 'lost motivation': -3,
  'no energy': -2, 'no point': -3, 'no hope': -4,
  // Intensified distress
  'very sad': -4, 'really sad': -4, 'so sad': -4, 'extremely sad': -5,
  'very stressed': -4, 'really stressed': -4, 'so stressed': -4,
  'very anxious': -4, 'really anxious': -4, 'so anxious': -4,
  'very worried': -4, 'really worried': -4,
  'very tired': -3, 'really tired': -3, 'so tired': -3,
  'very overwhelmed': -4, 'so overwhelmed': -4,
  'very depressed': -5, 'really depressed': -5,
  'very lonely': -4, 'so lonely': -4,
  'very scared': -4, 'really scared': -4,
  // Academic distress
  'low grade': -3, 'low marks': -3, 'bad grade': -3,
  'fail exam': -4, 'going to fail': -4,
  'falling behind': -3, 'fall behind': -3,
  'need help': -2,
  // Emotional state phrases
  'feel lost': -3, 'feeling lost': -3,
  'feel hopeless': -4, 'feeling hopeless': -4,
  'feel worthless': -5, 'feeling worthless': -5,
  'feel useless': -4, 'feeling useless': -4,
  'feel empty': -3, 'feeling empty': -3,
  'feel alone': -3, 'feeling alone': -3,
  'feel terrible': -4, 'feeling terrible': -4,
  'feel awful': -4, 'feeling awful': -4,
  'break down': -4, 'breaking down': -4,
  'give up': -4, 'giving up': -4, 'want to give up': -5,
  // Crisis — single words included here so they always appear as named signals
  suicide: -5, 'commit suicide': -5,
  'self-harm': -5, 'self harm': -5, 'selfharm': -5,
  'want to die': -5, 'hurt myself': -5, 'end my life': -5, 'kill myself': -5,
  // Positive phrases
  'sleep well': 3, 'slept well': 3, 'sleeping well': 3,
  'feel good': 3, 'feeling good': 3,
  'feel better': 2, 'feeling better': 2,
  'feel great': 4, 'feeling great': 4,
  'feel happy': 4, 'feeling happy': 4,
  'feel calm': 3, 'feeling calm': 3,
  'feel confident': 3, 'feeling confident': 3,
  'feel motivated': 3, 'feeling motivated': 3,
  'feel relaxed': 3, 'feeling relaxed': 3,
  'do well': 3, 'did well': 3, 'doing well': 3,
  'much better': 3, 'so much better': 4,
  'no stress': 3
};

// Sorted longest-first so a longer phrase consumes its substring before the substring can match
const SORTED_PHRASES = Object.entries(PHRASE_SCORES).sort(([a], [b]) => b.length - a.length);

const computeSentimentScore = (texts: string[]): { score: number; signals: string[] } => {
  const combined = texts.join(' ').toLowerCase();

  // Phase 1 — phrase matching, longest-first to prevent substring double-matches
  const phraseMatches: { phrase: string; score: number }[] = [];
  let remaining = combined;
  for (const [phrase, score] of SORTED_PHRASES) {
    if (remaining.includes(phrase)) {
      phraseMatches.push({ phrase, score });
      // Consume matched text so shorter substrings inside it cannot also match
      remaining = remaining.split(phrase).join(' ');
    }
  }

  // Phase 2 — AFINN word-level analysis on the original text
  const afinnResult = sentimentAnalyzer.analyze(combined, { extras: ACADEMIC_EXTRAS });
  const wordSignals = [...new Set([...afinnResult.positive, ...afinnResult.negative])];

  // Combine: phrases weighted 2× (more contextually precise than individual words)
  const phraseSentiment = phraseMatches.length > 0
    ? clampNumber(phraseMatches.reduce((s, m) => s + m.score, 0) / (phraseMatches.length * 5), -1, 1)
    : null;
  const afinnSentiment = clampNumber(afinnResult.comparative / 5, -1, 1);

  const finalScore = phraseSentiment !== null
    ? clampNumber((phraseSentiment * 2 + afinnSentiment) / 3, -1, 1)
    : afinnSentiment;

  // Phrase signals first (more meaningful), then AFINN word signals; limit to 10
  const signals = [...new Set([...phraseMatches.map((m) => m.phrase), ...wordSignals])].slice(0, 10);
  return { score: finalScore, signals };
};

// Analyse student messages in a session, return scoreDelta and signals
const analyzeSessionSentiment = (
  currentMessage: string,
  contextMessages: ChatMessage[]
): { scoreDelta: number; signals: string[]; reasonSummary: string } => {
  const texts = [currentMessage, ...contextMessages.filter((m) => m.role === 'user').map((m) => m.content)];
  const { score, signals } = computeSentimentScore(texts);
  const scoreDelta = clampNumber(Math.round(score * 10), -10, 10);

  const reasonSummary = signals.length > 0
    ? `Sentiment score ${score.toFixed(2)} based on: ${signals.slice(0, 4).join(', ')}.`
    : 'No strong sentiment signals detected; treated as neutral.';

  return { scoreDelta, signals, reasonSummary };
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

  const systemPrompt = req.customSystemPrompt ?? getSystemPrompt(req.subject);

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

  // Load only student messages (exclude AI replies)
  const rows = await prisma.chatHistory.findMany({
    where: { sessionId: resolvedSession.id, sender: 'USER' },
    orderBy: { createdAt: 'asc' },
    select: { message: true }
  });

  const texts = rows.map((r) => r.message);
  const { score: sentimentScore, signals: matched } = computeSentimentScore(texts);
  const scoreDelta = clampNumber(Math.round(sentimentScore * 10), -10, 10);

  const reasonSummary = matched.length > 0
    ? `Whole-session sentiment: ${sentimentScore.toFixed(2)} based on: ${matched.slice(0, 4).join(', ')}.`
    : 'No strong sentiment signals detected in the session; treated as neutral.';

  const currentScore = await getLatestMentalHealthScore(studentId);
  const nextScore = clampNumber(currentScore + scoreDelta, -100, 100);
  const scoreProfile = classifyDelta(scoreDelta);
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
      analysisModel: 'afinn-sentiment-v2'
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

  // Label reflects THIS message's sentiment; accumulated score tracks the trend
  const messageProfile = classifyDelta(scoreDelta);

  const analysis: MentalHealthAnalysisOutput = {
    scoreDelta,
    ...messageProfile,
    reasonSummary,
    signals
  };

  const nextScore = clampNumber(currentScore + scoreDelta, -100, 100);
  const normalizedSignals = normalizeSignals(signals);
  const record = await prisma.mentalHealth.create({
    data: {
      studentId: input.studentId,
      sourceSessionId: input.sessionId || null,
      statusScore: nextScore,
      scoreDelta,
      statusLabel: messageProfile.statusLabel,
      reasonSummary,
      signals: normalizedSignals.join(', '),
      emotionPolarity: messageProfile.emotionPolarity,
      riskLevel: messageProfile.riskLevel,
      keywords: normalizedSignals.join(', '),
      analysisModel: 'afinn-sentiment-v2'
    }
  });

  return {
    ...messageProfile,
    scoreDelta,
    currentScore: nextScore,
    reasonSummary,
    signals: normalizedSignals,
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
  sessionId?: string,
  customSystemPrompt?: string
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
    subject,
    customSystemPrompt
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

const VALID_MASTERY: MasteryLevel[] = ['UNMASTERED', 'PARTIAL', 'MASTERED'];
const MASTERY_RANK: Record<MasteryLevel, number> = { UNMASTERED: 0, PARTIAL: 1, MASTERED: 2 };

// Analyse the Socratic conversation and upsert Progress records for engaged knowledge points.
// Designed to run fire-and-forget — never throws.
export const analyzeLearningBehavior = async (
  studentId: string,
  sessionId: string
): Promise<void> => {
  try {
    const session = await resolveChatSession(sessionId);
    if (!session) return;

    const subject = (session as any).subject as string | null | undefined;

    // Fetch knowledge points scoped to the session subject when available
    const knowledgePoints = await prisma.knowledgePoint.findMany({
      where: subject ? {
        chapter: { subject: { name: { contains: subject, mode: 'insensitive' } } }
      } : {},
      select: { id: true, name: true }
    });

    if (knowledgePoints.length === 0) return;

    const history = await getConversationHistory(session.id);
    if (history.length === 0) return;

    const kpList = knowledgePoints.map(kp => kp.name).join('\n');
    const conversationText = history.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n');

    const raw = await callOpenRouterCompletion({
      systemPrompt: getLearningAnalysisPrompt(),
      messages: [{ role: 'user', content: `Knowledge points:\n${kpList}\n\nConversation:\n${conversationText}` }],
      temperature: 0.2,
      maxTokens: 400
    });

    let parsed: { knowledgePoints: Array<{ name: string; mastery: string }> };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    if (!Array.isArray(parsed?.knowledgePoints)) return;

    // Case-insensitive lookup so minor AI formatting differences don't break matching
    const kpMap = new Map(knowledgePoints.map(kp => [kp.name.toLowerCase().trim(), kp.id]));

    // Collect the KP ids the AI identified, then fetch existing progress in one query
    const matchedKpIds = parsed.knowledgePoints
      .map(item => kpMap.get(item.name.toLowerCase().trim()))
      .filter((id): id is string => id !== undefined);

    const existingProgress = await prisma.progress.findMany({
      where: { studentId, knowledgePointId: { in: matchedKpIds } },
      select: { knowledgePointId: true, mastery: true }
    });
    const existingMap = new Map(existingProgress.map(p => [p.knowledgePointId, p.mastery]));

    for (const item of parsed.knowledgePoints) {
      const kpId = kpMap.get(item.name.toLowerCase().trim());
      if (!kpId) continue;

      const aiMastery: MasteryLevel = VALID_MASTERY.includes(item.mastery as MasteryLevel)
        ? (item.mastery as MasteryLevel)
        : 'PARTIAL';

      // Mastery only moves forward — never downgrade an existing level
      const currentMastery = existingMap.get(kpId);
      const effectiveMastery = currentMastery && MASTERY_RANK[currentMastery] >= MASTERY_RANK[aiMastery]
        ? currentMastery
        : aiMastery;

      await prisma.progress.upsert({
        where: { studentId_knowledgePointId: { studentId, knowledgePointId: kpId } },
        create: { studentId, knowledgePointId: kpId, mastery: effectiveMastery, studyTimeSeconds: 60 },
        // Study time is set once on first engagement; subsequent analysis runs only update mastery
        update: { mastery: effectiveMastery }
      });

      console.log(`[LEARNING ANALYSIS] ${item.name}: ${currentMastery ?? 'NEW'} → ${effectiveMastery}`);
    }
  } catch (error) {
    console.error('[LEARNING ANALYSIS] Failed:', error instanceof Error ? error.message : error);
  }
};

export const generateMentalHealthResponse = async (
  userMessage: string,
  sessionId: string,
  customSystemPrompt?: string
): Promise<{ response: string; model: string }> => {
  const activeModel = await getActiveAIModel();

  let conversationHistory: ChatMessage[] = [];
  try {
    const session = await resolveChatSession(sessionId);
    if (session) {
      conversationHistory = await getConversationHistory(session.id);
    }
  } catch (error) {
    console.error('[AI Service] Error fetching mental chat history:', error);
  }

  const systemPrompt = customSystemPrompt ?? getMentalChatSystemPrompt();
  const messages: ChatMessage[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await callOpenRouterCompletion({ systemPrompt, messages, temperature: 0.7, maxTokens: 300 });
    return { response: response || 'I\'m here for you. Can you tell me more about how you\'re feeling?', model: activeModel };
  } catch (error) {
    console.error('[AI Service] Mental chat OpenRouter failed, using fallback:', error);
    return {
      response: 'I hear you, and I\'m glad you shared that. It sounds like things have been tough. Would you like to talk more about what\'s been on your mind?',
      model: 'fallback'
    };
  }
};
