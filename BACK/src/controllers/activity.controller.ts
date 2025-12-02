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

    let { prompt, provider, type, subject, grade, title, description, visibility, additionalParams } = req.body;

    // Procesar archivo PDF si existe
    let pdfContext = '';
    let pdfFileName = '';

    if (req.file) {
      try {
        const ocrService = (await import('../services/ocr.service')).default;
        pdfContext = await ocrService.extractTextFromPDF(req.file.path);
        pdfFileName = req.file.originalname;

        // Eliminar archivo temporal después de procesarlo
        const fs = await import('fs');
        fs.unlinkSync(req.file.path);
      } catch (ocrError: any) {
        return res.status(400).json({ error: `Error al procesar el PDF: ${ocrError.message}` });
      }
    }

    // Si no se proporciona prompt, generarlo automáticamente
    if (!prompt || prompt.trim() === '') {
      // Parse additionalParams if needed to get more details
      let params = additionalParams;
      if (typeof additionalParams === 'string') {
        try {
          params = JSON.parse(additionalParams);
        } catch (e) {
          params = {};
        }
      }

      // Generar prompt automáticamente basado en los campos del formulario
      const parts = [];

      if (type === 'EXAM') {
        parts.push(`Genera un examen`);
        if (params?.cantidadPreguntas) {
          parts.push(`de ${params.cantidadPreguntas} preguntas`);
        }
        if (subject) parts.push(`sobre ${subject}`);
        if (grade) parts.push(`para nivel ${grade}`);
        if (params?.dificultad) parts.push(`con dificultad ${params.dificultad}`);
        if (params?.cantidadOM) parts.push(`\n- ${params.cantidadOM} preguntas de opción múltiple`);
        if (params?.cantidadVF) parts.push(`\n- ${params.cantidadVF} preguntas de verdadero/falso`);
        if (title) parts.push(`\nTítulo: ${title}`);
        if (description) parts.push(`\nDescripción: ${description}`);
        if (params?.instruccionesAdicionales) parts.push(`\nInstrucciones adicionales: ${params.instruccionesAdicionales}`);
      } else {
        parts.push(`Genera un(a) ${type.toLowerCase()}`);
        if (subject) parts.push(`sobre ${subject}`);
        if (grade) parts.push(`para nivel ${grade}`);
        if (title) parts.push(`\nTítulo: ${title}`);
        if (description) parts.push(`\nDescripción: ${description}`);
      }

      prompt = parts.join(' ');
    }

    const creditCost = creditService.getCreditCost(provider as AIProvider);
    const userCredits = await creditService.getUserCredits(userId);

    if (userCredits < creditCost) {
      return res.status(402).json({ error: 'Insufficient credits' });
    }

    // Parse additionalParams if it's a string
    let parsedAdditionalParams = additionalParams;
    if (typeof additionalParams === 'string') {
      try {
        parsedAdditionalParams = JSON.parse(additionalParams);
      } catch (e) {
        // If parsing fails, use as-is
      }
    }

    const aiResponse = await aiService.generate({
      prompt,
      provider: provider as AIProvider,
      type: type as ActivityType,
      subject,
      grade,
      additionalParams: parsedAdditionalParams,
      pdfContext,
      pdfFileName,
    });

    await creditService.deductCredits(
      userId,
      creditCost,
      provider as AIProvider,
      `Generated ${type} content`
    );

    const activity = await activityService.createActivity({
      title: title || `${type} - ${subject}`,
      description: description,
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
