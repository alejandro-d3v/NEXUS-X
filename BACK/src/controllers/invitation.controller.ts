import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import invitationService from '../services/invitation.service';

export const generateCode = async (req: AuthRequest, res: Response) => {
    try {
        const { gradeId, description, maxUses, expiresAt } = req.body;
        const createdBy = req.user?.userId;

        if (!createdBy) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const code = await invitationService.generateCode(gradeId, createdBy, {
            description,
            maxUses,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });

        return res.status(201).json(code);
    } catch (error: any) {
        const status = error.message.includes('not found') ? 404 : 400;
        return res.status(status).json({ error: error.message });
    }
};

export const validateCode = async (req: AuthRequest, res: Response) => {
    try {
        const { code } = req.body;

        const validation = await invitationService.validateCode(code);

        res.json(validation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const useCode = async (req: AuthRequest, res: Response) => {
    try {
        const { code, email, password, firstName, lastName, studentId, notes } = req.body;

        const result = await invitationService.useCode(
            code,
            { email, password, firstName, lastName },
            { studentId, notes }
        );

        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getCodesByGrade = async (req: AuthRequest, res: Response) => {
    try {
        const { gradeId } = req.params;

        const codes = await invitationService.getCodesByGrade(gradeId);

        res.json(codes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCodesByInstitution = async (req: AuthRequest, res: Response) => {
    try {
        const { institutionId } = req.params;

        const codes = await invitationService.getCodesByInstitution(institutionId);

        res.json(codes);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deactivateCode = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const code = await invitationService.deactivateCode(id);

        res.json(code);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const updateCode = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { description, maxUses, expiresAt, isActive } = req.body;

        const code = await invitationService.updateCodeSettings(id, {
            description,
            maxUses,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            isActive,
        });

        res.json(code);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

// Public endpoint for joining via invitation link
export const joinWithCode = async (req: AuthRequest, res: Response) => {
    try {
        const { code } = req.params;
        const { firstName, lastName, email, password } = req.body;
        const userId = req.user?.userId; // Will be undefined if not authenticated

        const result = await invitationService.joinWithCode(
            code,
            userId,
            { firstName, lastName, email, password }
        );

        res.status(200).json(result);
    } catch (error: any) {
        const status = error.message.includes('expired') ||
            error.message.includes('maximum') ||
            error.message.includes('already enrolled') ||
            error.message.includes('Invalid') ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
};
