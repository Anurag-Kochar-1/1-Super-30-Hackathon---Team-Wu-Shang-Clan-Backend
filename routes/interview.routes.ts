import express from 'express';
import interviewController from '../controllers/interview.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createInterviewSchema } from '../schemas/interview.schema';

const router = express.Router();

router.use(authenticate);

router.post(
    '/',
    validateRequest(createInterviewSchema),
    interviewController.createInterview
);

router.get('/', interviewController.getAllInterviews);

router.get('/:id', interviewController.getInterviewById);
router.post('/tts', interviewController.textToSpeech);

export default router;