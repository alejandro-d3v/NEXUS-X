import { Router } from 'express';
import { exportToWord, exportToExcel, exportToPdf } from '../controllers/export.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id/word', authenticate, exportToWord);
router.get('/:id/excel', authenticate, exportToExcel);
router.get('/:id/pdf', authenticate, exportToPdf);

export default router;
