import { Router } from 'express';
import { getCredits, getCreditHistory, addCredits } from '../controllers/credit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../types';
import { addCreditsSchema } from '../utils/validation-schemas';

const router = Router();

router.get('/balance', authenticate, getCredits);
router.get('/history', authenticate, getCreditHistory);
router.post('/add', authenticate, authorize(UserRole.ADMIN), validate(addCreditsSchema), addCredits);

export default router;
