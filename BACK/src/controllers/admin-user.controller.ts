import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import adminUserService from '../services/admin-user.service';

export const createTeacher = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, firstName, lastName, institutionId, subject, title, notes } =
            req.body;

        const result = await adminUserService.createTeacher(
            { email, password, firstName, lastName },
            institutionId,
            { subject, title, notes }
        );

        res.status(201).json(result);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            institutionId,
            gradeId,
            notes,
        } = req.body;

        const result = await adminUserService.createStudent(
            { email, password, firstName, lastName },
            institutionId,
            gradeId,
            { notes }
        );

        res.status(201).json(result);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const assignTeacherToInstitution = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { institutionId, subject, title, notes } = req.body;

        const teacherProfile = await adminUserService.assignTeacherToInstitution(
            id,
            institutionId,
            { subject, title, notes }
        );

        res.json(teacherProfile);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const assignStudentToGrade = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { gradeId, institutionId, notes } = req.body;

        const studentProfile = await adminUserService.assignStudentToGrade(
            id,
            gradeId,
            institutionId,
            { notes }
        );

        res.json(studentProfile);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await adminUserService.updateUserRole(id, role);

        res.json(user);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
};

export const getAllUsersWithProfiles = async (req: AuthRequest, res: Response) => {
    try {
        const { role, institutionId, isActive } = req.query;

        const users = await adminUserService.getAllUsersWithProfiles({
            role: role as any,
            institutionId: institutionId as string,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });

        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserWithProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const user = await adminUserService.getUserWithProfile(id);

        res.json(user);
    } catch (error: any) {
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

export const deactivateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const user = await adminUserService.deactivateUser(userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const activateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const user = await adminUserService.activateUser(userId);
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { firstName, lastName, email, password, credits } = req.body;
        const user = await adminUserService.updateUser(userId, {
            firstName,
            lastName,
            email,
            password,
            credits,
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        await adminUserService.deleteUser(userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
