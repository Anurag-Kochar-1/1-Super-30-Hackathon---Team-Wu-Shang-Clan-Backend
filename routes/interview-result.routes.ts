import express from 'express';
import interviewResultController from '../controllers/interview-result.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { generateResultSchema } from '../schemas/interview-result.schema';

const router = express.Router();
router.use(authenticate);
router.get('/', interviewResultController.getAllResults);
router.get('/:id', interviewResultController.getResultById);
router.post(
    '/',
    validateRequest(generateResultSchema),
    interviewResultController.generateResult
);

export default router;