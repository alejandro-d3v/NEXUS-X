import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import gradeService from '../services/grade.service';
import prisma from '../config/database';

export const createGrade = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, description, subject, level, institutionId } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get teacher profile ID from user
        const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!teacherProfile) {
            res.status(404).json({ error: 'Teacher profile not found' });
            return;
        }

        const grade = await gradeService.createGrade({
            name,
            description,
            subject,
            level,
            institutionId,
            teacherId: teacherProfile.id,
        });

        res.status(201).json(grade);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const getAllGrades = async (req: AuthRequest, res: Response) => {
    try {
        const { institutionId, teacherId, isActive, search } = req.query;

        const grades = await gradeService.getAllGrades({
            institutionId: institutionId as string,
            teacherId: teacherId as string,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            search: search as string,
        });

        res.json(grades);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getGradeById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const grade = await gradeService.getGradeById(id);

        res.json(grade);
    } catch (error: any) {
        const status = error.message === 'Grade not found' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

export const updateGrade = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, subject, level, isActive } = req.body;

        const grade = await gradeService.updateGrade(id, {
            name,
            description,
            subject,
            level,
            isActive,
        });

        res.json(grade);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteGrade = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const result = await gradeService.deleteGrade(id);

        res.json(result);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const assignTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { teacherId } = req.body;

        const grade = await gradeService.assignTeacher(id, teacherId);

        res.json(grade);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const getGradeStudents = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const students = await gradeService.getGradeStudents(id);

        res.json(students);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyGrades = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Get teacher profile for this user
        const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { userId },
        });

        if (!teacherProfile) {
            res.status(404).json({ error: 'Teacher profile not found' });
            return;
        }

        // Get grades for this teacher
        const grades = await gradeService.getAllGrades({
            teacherId: teacherProfile.id,
        });

        res.json(grades);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
