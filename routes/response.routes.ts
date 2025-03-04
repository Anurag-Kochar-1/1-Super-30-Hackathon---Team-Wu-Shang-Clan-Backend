import express from 'express';
import responseController from '../controllers/response.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { submitResponseSchema } from '../schemas/question-response.schema';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  validateRequest(submitResponseSchema),
  responseController.submitResponse
);

router.get('/', responseController.getResponsesBySessionId);

export default router;