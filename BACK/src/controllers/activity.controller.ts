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

    const { prompt, provider, type, subject, title, description, visibility } = req.body;

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

    const { type, subject } = req.query;

    const activities = await activityService.getUserActivities(userId, {
      type: type as ActivityType,
      subject: subject as string,
    });

    return res.json(activities);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPublicActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { type, subject } = req.query;

    const activities = await activityService.getPublicActivities({
      type: type as ActivityType,
      subject: subject as string,
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

// Summary generation
export const generateSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, text, summaryLength, summaryStyle, subject, visibility, aiProvider } = req.body;
    const file = req.file;

    // Extract text from file if provided
    let sourceText = text;
    if (file) {
      const ocrService = require('../services/ocr.service').default;
      sourceText = await ocrService.extractTextFromFile(file.buffer, file.mimetype);
    }

    if (!sourceText) {
      return res.status(400).json({ error: 'No text or file provided' });
    }

    // Calculate credit cost
    const summaryService = require('../services/summary.service').default;
    const creditCost = summaryService.calculateCreditCost(sourceText.length);
    const userCredits = await creditService.getUserCredits(userId);

    if (userCredits < creditCost) {
      return res.status(402).json({ error: 'Insufficient credits' });
    }

    // Generate summary
    const summaryResult = await summaryService.generateSummary({
      text: sourceText,
      length: summaryLength || 'medium',
      style: summaryStyle || 'paragraph',
      aiProvider: aiProvider as AIProvider,
    });

    // Deduct credits
    await creditService.deductCredits(
      userId,
      creditCost,
      aiProvider as AIProvider,
      'Generated summary'
    );

    // Create activity
    const activity = await activityService.createActivity({
      title: title || 'Summary',
      description,
      type: 'SUMMARY' as ActivityType,
      visibility: visibility || ActivityVisibility.PRIVATE,
      content: {
        originalText: sourceText,
        summary: summaryResult.summary,
        keyPoints: summaryResult.keyPoints,
        wordCount: {
          original: summaryService['countWords'](sourceText),
          summary: summaryResult.wordCount,
        },
        metadata: {
          summaryLength,
          summaryStyle,
          generatedAt: new Date().toISOString(),
        },
        sourceFile: file ? {
          name: file.originalname,
          type: file.mimetype,
          size: file.size,
        } : undefined,
      },
      subject,
      aiProvider: aiProvider as AIProvider,
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

// Assign activity to grades
export const assignActivityToGrades = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { gradeIds } = req.body;

    if (!gradeIds || !Array.isArray(gradeIds)) {
      return res.status(400).json({ error: 'gradeIds must be an array' });
    }

    const assignments = await activityService.assignToGrades(id, gradeIds, userId);

    return res.json({ assignments });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

// Get activities by grade
export const getActivitiesByGrade = async (req: AuthRequest, res: Response) => {
  try {
    const { gradeId } = req.params;

    const activities = await activityService.getActivitiesByGrade(gradeId);

    return res.json(activities);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

// Get student activities
export const getStudentActivities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const activities = await activityService.getStudentActivities(userId);

    return res.json(activities);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
