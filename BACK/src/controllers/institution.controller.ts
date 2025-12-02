import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import institutionService from '../services/institution.service';

export const createInstitution = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, address, phone, email } = req.body;

        const institution = await institutionService.createInstitution({
            name,
            description,
            address,
            phone,
            email,
        });

        res.status(201).json(institution);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllInstitutions = async (req: AuthRequest, res: Response) => {
    try {
        const { isActive, search } = req.query;

        const institutions = await institutionService.getAllInstitutions({
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            search: search as string,
        });

        res.json(institutions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getInstitutionById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const institution = await institutionService.getInstitutionById(id);

        res.json(institution);
    } catch (error: any) {
        const status = error.message === 'Institution not found' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

export const updateInstitution = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, address, phone, email, isActive } = req.body;

        const institution = await institutionService.updateInstitution(id, {
            name,
            description,
            address,
            phone,
            email,
            isActive,
        });

        res.json(institution);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteInstitution = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const institution = await institutionService.deleteInstitution(id);

        res.json(institution);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const getInstitutionStats = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const stats = await institutionService.getInstitutionStats(id);

        res.json(stats);
    } catch (error: any) {
        const status = error.message === 'Institution not found' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};
