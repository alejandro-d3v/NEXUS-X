import { Router } from 'express';
import { exportToWord, exportToExcel } from '../controllers/export.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id/word', authenticate, exportToWord);
router.get('/:id/excel', authenticate, exportToExcel);

export default router;
