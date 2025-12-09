import { Router } from 'express';
import {
  generateContent,
  getActivity,
  getUserActivities,
  getPublicActivities,
  getPublicActivitiesForTeachers,
  updateActivity,
  deleteActivity,
  generateSummary,
  assignActivityToGrades,
  getActivitiesByGrade,
  getStudentActivities,
} from '../controllers/activity.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { generateActivitySchema, updateActivitySchema } from '../utils/validation-schemas';
import { upload } from '../middlewares/upload.middleware';
import { UserRole } from '../types';

const router = Router();

// Existing routes
router.post('/generate', authenticate, validate(generateActivitySchema), generateContent);
router.get('/my-activities', authenticate, getUserActivities);
router.get('/public', getPublicActivities);
router.get('/public-teachers', authenticate, authorize(UserRole.TEACHER), getPublicActivitiesForTeachers);
router.get('/student', authenticate, authorize(UserRole.STUDENT), getStudentActivities);
router.get('/:id', authenticate, getActivity);
router.put('/:id', authenticate, validate(updateActivitySchema), updateActivity);
router.delete('/:id', authenticate, deleteActivity);

// New routes for summary generation
router.post('/summary', authenticate, upload.single('file'), generateSummary);

// Activity-Grade assignment routes
router.post('/:id/assign-grades', authenticate, assignActivityToGrades);
router.get('/by-grade/:gradeId', authenticate, getActivitiesByGrade);

export default router;
