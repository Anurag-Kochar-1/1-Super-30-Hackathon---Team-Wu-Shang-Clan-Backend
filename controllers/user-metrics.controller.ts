import { Response } from 'express';
import { AuthRequest } from '../types/user-metrics.types';
import userMetricsService from '../services/user-metrics.service';

export class UserMetricsController {
    async getUserMetrics(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const metrics = await userMetricsService.getUserMetrics(req.user.id);

            res.status(200).json(metrics);
        } catch (error) {
            console.error('Get user metrics error:', error);
            res.status(500).json({ message: 'Failed to get user metrics' });
        }
    }
}

export default new UserMetricsController();