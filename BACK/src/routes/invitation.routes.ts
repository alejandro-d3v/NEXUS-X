import { Router } from 'express';
import {
    generateCode,
    validateCode,
    useCode,
    getCodesByGrade,
    getCodesByInstitution,
    deactivateCode,
    updateCode,
} from '../controllers/invitation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// Generate code - ADMIN and TEACHER
router.post('/generate', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), generateCode);

// Validate and use code - PUBLIC (no auth required for student registration)
router.post('/validate', validateCode);
router.post('/use', useCode);

// View codes - ADMIN and TEACHER
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), getCodesByGrade);
router.get('/grade/:gradeId', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), getCodesByGrade);
router.get('/institution/:institutionId', authenticate, authorize(UserRole.ADMIN), getCodesByInstitution);

// Manage codes - ADMIN and TEACHER
router.delete('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), deactivateCode);
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), updateCode);

export default router;
