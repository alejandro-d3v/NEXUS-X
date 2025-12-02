import { Router } from 'express';
import {
    createInstitution,
    getAllInstitutions,
    getInstitutionById,
    updateInstitution,
    deleteInstitution,
    getInstitutionStats,
} from '../controllers/institution.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Only ADMIN can create and delete institutions
// ADMIN and TEACHER can view institutions
router.post('/', authenticate, authorize(UserRole.ADMIN), createInstitution);
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), getAllInstitutions);
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), getInstitutionById);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), updateInstitution);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteInstitution);
router.get('/:id/stats', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), getInstitutionStats);

export default router;
