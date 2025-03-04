import express from 'express';
import questionController from '../controllers/question.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', questionController.getQuestionsByInterviewId);

export default router;