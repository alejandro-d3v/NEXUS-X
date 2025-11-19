import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { UserRole } from '../types';
import { updateUserSchema } from '../utils/validation-schemas';

const router = Router();

router.get('/', authenticate, authorize(UserRole.ADMIN), getAllUsers);
router.get('/:id', authenticate, authorize(UserRole.ADMIN), getUserById);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), validate(updateUserSchema), updateUser);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteUser);

export default router;
