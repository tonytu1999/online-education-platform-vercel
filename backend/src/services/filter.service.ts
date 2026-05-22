import prisma from '../config/prisma';

export const isMessageForbidden = async (message: string): Promise<boolean> => {
  const forbiddenKeywords = await prisma.forbiddenKeyword.findMany();
  
  const lowerMessage = message.toLowerCase();
  for (const keyword of forbiddenKeywords) {
    if (lowerMessage.includes(keyword.word.toLowerCase())) {
      return true;
    }
  }

  return false;
};
