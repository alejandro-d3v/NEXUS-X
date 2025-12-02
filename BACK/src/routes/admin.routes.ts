import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as adminUserController from '../controllers/admin-user.controller';
import { UserRole } from '../types';

const router = Router();

// All routes require ADMIN role
router.use(authenticate, authorize(UserRole.ADMIN));

// User management
router.post('/users/teacher', adminUserController.createTeacher);
router.post('/users/student', adminUserController.createStudent);
router.get('/users', adminUserController.getAllUsersWithProfiles);
router.patch('/users/:userId/role', adminUserController.updateUserRole);
router.patch('/users/:userId/deactivate', adminUserController.deactivateUser);
router.patch('/users/:userId/activate', adminUserController.activateUser);
router.patch('/users/:userId', adminUserController.updateUser);

export default router;
