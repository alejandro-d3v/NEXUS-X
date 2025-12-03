import { Router } from 'express';
import {
  generateContent,
  getActivity,
  getUserActivities,
  getPublicActivities,
  updateActivity,
  deleteActivity,
  generateSummary,
  assignActivityToGrades,
  getActivitiesByGrade,
  getStudentActivities,
} from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { generateActivitySchema, updateActivitySchema } from '../utils/validation-schemas';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Existing routes
router.post('/generate', authenticate, validate(generateActivitySchema), generateContent);
router.get('/my-activities', authenticate, getUserActivities);
router.get('/public', getPublicActivities);
router.get('/:id', authenticate, getActivity);
router.put('/:id', authenticate, validate(updateActivitySchema), updateActivity);
router.delete('/:id', authenticate, deleteActivity);

// New routes for summary generation
router.post('/summary', authenticate, upload.single('file'), generateSummary);

// Activity-Grade assignment routes
router.post('/:id/assign-grades', authenticate, assignActivityToGrades);
router.get('/by-grade/:gradeId', authenticate, getActivitiesByGrade);
router.get('/student/my-activities', authenticate, getStudentActivities);

export default router;
