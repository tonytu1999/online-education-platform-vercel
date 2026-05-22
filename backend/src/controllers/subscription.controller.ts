import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

export const getSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { subscriptionPlan: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ plan: user.subscriptionPlan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const upgradeSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // This is a placeholder for the Freemium MVP
    // In a real app, you would integrate Stripe/Paypal here.
    const { plan } = req.body;
    
    if (plan !== 'BASIC' && plan !== 'PREMIUM') {
      res.status(400).json({ error: 'Invalid subscription plan' });
      return;
    }
    
    const user = await prisma.user.update({
      where: { id: req.user?.id },
      data: { subscriptionPlan: plan }
    });
    
    res.json({ message: 'Subscription updated successfully', plan: user.subscriptionPlan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
