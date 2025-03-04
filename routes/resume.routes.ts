import express from 'express';
import resumeController from '../controllers/resume.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createResumeSchema } from '../schemas/resume.schema';
const router = express.Router();

router.use(authenticate);

router.get('/', resumeController.getAllResumes);

router.get('/:id', resumeController.getResumeById);

router.post(
    '/',
    validateRequest(createResumeSchema),
    resumeController.createResume
);


router.delete('/:id', resumeController.deleteResume);

export default router;