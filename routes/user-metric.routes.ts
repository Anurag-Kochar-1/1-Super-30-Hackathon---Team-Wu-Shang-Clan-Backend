import express from 'express';
import userMetricsController from '../controllers/user-metrics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate);

router.get('/user', userMetricsController.getUserMetrics);

export default router;