import express from 'express';
import interviewSessionController from '../controllers/interview-session.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createInterviewSessionSchema, updateInterviewSessionSchema } from '../schemas/interview-session.schema';

const router = express.Router();

router.use(authenticate);

router.post(
    '/',
    validateRequest(createInterviewSessionSchema),
    interviewSessionController.createInterviewSession
);

router.put(
    '/:id',
    validateRequest(updateInterviewSessionSchema),
    interviewSessionController.updateInterviewSession
);

router.put(
    '/:id/end',
    interviewSessionController.endInterviewSession
);

router.get('/', interviewSessionController.getAllInterviewSessions);

router.get('/:id', interviewSessionController.getInterviewSessionById);

export default router;