import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import aiService from '../services/ai.service';
import creditService from '../services/credit.service';
import activityService from '../services/activity.service';
import { AIProvider, ActivityType, ActivityVisibility } from '../types';

export const generateContent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { prompt, provider, type, subject, grade, title, description, visibility } = req.body;

    const creditCost = creditService.getCreditCost(provider as AIProvider);
    const userCredits = await creditService.getUserCredits(userId);

    if (userCredits < creditCost) {
      return res.status(402).json({ error: 'Insufficient credits' });
    }

    const aiResponse = await aiService.generate({
      prompt,
      provider: provider as AIProvider,
      type: type as ActivityType,
      subject,
      grade,
    });

    await creditService.deductCredits(
      userId,
      creditCost,
      provider as AIProvider,
      `Generated ${type} content`
    );

    const activity = await activityService.createActivity({
      title: title || `${type} - ${subject}`,
      description,
      type: type as ActivityType,
      visibility: visibility || ActivityVisibility.PRIVATE,
      content: aiResponse.content,
      subject,
      grade,
      aiProvider: provider as AIProvider,
      creditCost,
      userId,
    });

    return res.json({
      activity,
      creditsRemaining: userCredits - creditCost,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const activity = await activityService.getActivityById(id, userId);

    res.json(activity);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserActivities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, subject, grade } = req.query;

    const activities = await activityService.getUserActivities(userId, {
      type: type as ActivityType,
      subject: subject as string,
      grade: grade as string,
    });

    return res.json(activities);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPublicActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { type, subject, grade } = req.query;

    const activities = await activityService.getPublicActivities({
      type: type as ActivityType,
      subject: subject as string,
      grade: grade as string,
    });

    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, visibility } = req.body;

    const activity = await activityService.updateActivity(id, userId, {
      title,
      description,
      visibility,
    });

    return res.json(activity);
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
};

export const deleteActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await activityService.deleteActivity(id, userId);

    return res.status(204).send();
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
};
