import express from 'express';
import chatController from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { sendChatMessageSchema } from '../schemas/chat.schema';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.post(
    '/',
    validateRequest(sendChatMessageSchema),
    chatController.sendChatMessage
);

router.get('/', chatController.getChatHistory);

export default router;