import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { sendMessage, clearConversation, getConversationHistory } from '../controllers/chat.controller';

const router = express.Router();

// Chat routes - authenticated
router.post('/:activityId/message', authenticate, sendMessage);
router.delete('/:activityId/clear', authenticate, clearConversation);
router.get('/:activityId/history', authenticate, getConversationHistory);

export default router;
