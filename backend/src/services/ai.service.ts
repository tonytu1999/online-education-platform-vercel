import prisma from '../config/prisma';

interface AIServiceRequest {
  message: string;
  context?: any;
}

export const getActiveAIModel = async (): Promise<string> => {
  const config = await prisma.systemConfig.findUnique({
    where: { key: 'ACTIVE_AI_MODEL' }
  });
  return config?.value || process.env.DEFAULT_AI_MODEL || 'CLAUDE';
};

const callClaude = async (req: AIServiceRequest) => {
  console.log('Calling Claude API...');
  return `[Claude] Socratic response to: "${req.message}". Why do you think that happens?`;
};

const callOpenAI = async (req: AIServiceRequest) => {
  console.log('Calling OpenAI API...');
  return `[OpenAI] Socratic response to: "${req.message}". What is the logical next step?`;
};

const callOpenRouter = async (req: AIServiceRequest) => {
  console.log('Calling OpenRouter API...');
  return `[OpenRouter] Socratic response to: "${req.message}". Can you explain your reasoning?`;
};

const callDeepSeek = async (req: AIServiceRequest) => {
  console.log('Calling DeepSeek API...');
  return `[DeepSeek] Socratic response to: "${req.message}". How does this connect to what we learned?`;
};

export const generateSocraticResponse = async (userMessage: string, context?: any): Promise<{ response: string; model: string }> => {
  const activeModel = await getActiveAIModel();
  const req = { message: userMessage, context };
  
  let response = '';

  switch (activeModel.toUpperCase()) {
    case 'OPENAI':
      response = await callOpenAI(req);
      break;
    case 'OPENROUTER':
      response = await callOpenRouter(req);
      break;
    case 'DEEPSEEK':
      response = await callDeepSeek(req);
      break;
    case 'CLAUDE':
    default:
      response = await callClaude(req);
      break;
  }

  return { response, model: activeModel };
};
