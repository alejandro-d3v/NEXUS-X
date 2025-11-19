import { Router } from 'express';
import authRoutes from './auth.routes';
import activityRoutes from './activity.routes';
import creditRoutes from './credit.routes';
import exportRoutes from './export.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/credits', creditRoutes);
router.use('/export', exportRoutes);
router.use('/users', userRoutes);

export default router;