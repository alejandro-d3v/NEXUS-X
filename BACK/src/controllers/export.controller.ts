import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import activityService from '../services/activity.service';
import exportService from '../services/export.service';

export const exportToWord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const activity = await activityService.getActivityById(id, userId);
    console.log('Actividad: ', activity);
    console.log('Actividad content: ', activity.content);
    const buffer = await exportService.exportToWord(activity);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${activity.title}.docx"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportToExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const activity = await activityService.getActivityById(id, userId);
    const buffer = await exportService.exportToExcel(activity);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${activity.title}.xlsx"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportToPdf = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const activity = await activityService.getActivityById(id, userId);
    const buffer = await exportService.exportToPdf(activity);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${activity.title}.pdf"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
