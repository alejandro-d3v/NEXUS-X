import { Router } from 'express';
import authRoutes from './auth.routes';
import activityRoutes from './activity.routes';
import creditRoutes from './credit.routes';
import exportRoutes from './export.routes';
import userRoutes from './user.routes';
import institutionRoutes from './institution.routes';
import gradeRoutes from './grade.routes';
import adminRoutes from './admin.routes';
import invitationRoutes from './invitation.routes';
import chatRoutes from './chat.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/credits', creditRoutes);
router.use('/export', exportRoutes);
router.use('/users', userRoutes);
router.use('/institutions', institutionRoutes);
router.use('/grades', gradeRoutes);
router.use('/admin', adminRoutes);
router.use('/invitations', invitationRoutes);
router.use('/chat', chatRoutes);

export default router;