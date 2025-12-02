import { Router } from 'express';
import {
    createGrade,
    getAllGrades,
    getGradeById,
    updateGrade,
    deleteGrade,
    assignTeacher,
    getGradeStudents,
} from '../controllers/grade.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const router = Router();

// ADMIN and TEACHER can create grades
// All authenticated users can view grades
// Only ADMIN can delete grades
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), createGrade);
router.get('/', authenticate, getAllGrades);
router.get('/:id', authenticate, getGradeById);
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), updateGrade);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteGrade);
router.post('/:id/assign-teacher', authenticate, authorize(UserRole.ADMIN), assignTeacher);
router.get('/:id/students', authenticate, authorize(UserRole.ADMIN, UserRole.TEACHER), getGradeStudents);

export default router;
