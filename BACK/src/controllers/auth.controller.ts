import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import authService from '../services/auth.service';
import { UserRole } from '../types';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, subject, grade, institution } = req.body;

    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role: role || UserRole.TEACHER,
      subject,
      grade,
      institution,
    });

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({ user: req.user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
