import prisma from '../config/prisma';

const getForbiddenWords = async (): Promise<string[]> => {
  const keywords = await prisma.forbiddenKeyword.findMany({ select: { word: true } });
  return keywords.map((k) => k.word.toLowerCase());
};

export const isResponseForbidden = async (response: string): Promise<boolean> => {
  const words = await getForbiddenWords();
  const lower = response.toLowerCase();
  return words.some((w) => lower.includes(w));
};
