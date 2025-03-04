import express from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
    validateRequest,
    registerSchema,
    loginSchema,
    updateUserSchema
} from '../middlewares/validate.middleware';

const router = express.Router();

router.post(
    '/register',
    validateRequest(registerSchema),
    authController.register
);

router.post(
    '/login',
    validateRequest(loginSchema),
    authController.login
);

router.get(
    '/me',
    authenticate,
    authController.getCurrentUser
);

router.put(
    '/me',
    authenticate,
    validateRequest(updateUserSchema),
    authController.updateProfile
);

export default router;