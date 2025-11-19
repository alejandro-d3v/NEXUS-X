import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import creditService from '../services/credit.service';

export const getCredits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credits = await creditService.getUserCredits(userId);

    return res.json({ credits });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getCreditHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const history = await creditService.getCreditHistory(userId, limit);

    return res.json(history);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addCredits = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, description } = req.body;

    await creditService.addCredits(userId, amount, description);

    const newBalance = await creditService.getUserCredits(userId);

    res.json({ credits: newBalance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
