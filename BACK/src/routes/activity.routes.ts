import { Router } from 'express';
import {
  generateContent,
  getActivity,
  getUserActivities,
  getPublicActivities,
  updateActivity,
  deleteActivity,
} from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { generateActivitySchema, updateActivitySchema } from '../utils/validation-schemas';

import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post('/generate', authenticate, upload.single('pdfFile'), validate(generateActivitySchema), generateContent);
router.get('/my-activities', authenticate, getUserActivities);
router.get('/public', getPublicActivities);
router.get('/:id', authenticate, getActivity);
router.put('/:id', authenticate, validate(updateActivitySchema), updateActivity);
router.delete('/:id', authenticate, deleteActivity);

export default router;
