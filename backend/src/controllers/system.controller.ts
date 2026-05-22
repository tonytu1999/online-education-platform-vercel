import { Request, Response } from 'express';
import prisma from '../config/prisma';

export const getSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const configs = await prisma.systemConfig.findMany();
    // Convert array of key/value pairs to a config object
    const configMap = configs.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    
    res.json(configMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSystemConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { key, value } = req.body;
    
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getForbiddenKeywords = async (req: Request, res: Response): Promise<void> => {
    try {
        const keywords = await prisma.forbiddenKeyword.findMany();
        res.json(keywords);
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

export const createForbiddenKeyword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { word } = req.body;
        const keyword = await prisma.forbiddenKeyword.create({
            data: { word }
        });
        res.status(201).json(keyword);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const deleteForbiddenKeyword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.forbiddenKeyword.delete({
          where: { id: id as string }
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}

