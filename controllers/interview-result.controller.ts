import { Response } from 'express';
import { AuthRequest, GenerateResultDto } from '../types/interview-result.types';
import interviewResultService from '../services/interview-result.service';

export class InterviewResultController {
    /**
     * Get all results for current user
     * GET /api/interview-results
     */
    async getAllResults(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const results = await interviewResultService.getAllResultsByUserId(req.user.id);

            res.status(200).json(results);
        } catch (error) {
            console.error('Get all results error:', error);
            res.status(500).json({ message: 'Failed to get results' });
        }
    }

    /**
     * Get specific result with detailed metrics
     * GET /api/interview-results/:id
     */
    async getResultById(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const resultId = req.params.id;
            const result = await interviewResultService.getResultById(resultId, req.user.id);

            if (!result) {
                res.status(404).json({ message: 'Result not found' });
                return;
            }

            res.status(200).json(result);
        } catch (error) {
            console.error('Get result by ID error:', error);
            res.status(500).json({ message: 'Failed to get result' });
        }
    }

    /**
     * Generate result
     * POST /api/interview-results
     */
    async generateResult(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const resultData: GenerateResultDto = req.body;

            try {
                const result = await interviewResultService.generateResult(
                    resultData,
                    req.user.id
                );
                res.status(201).json(result);
            } catch (error: any) {
                if (error.message === 'Interview session not found or not owned by user') {
                    res.status(404).json({ message: error.message });
                } else if (
                    error.message === 'Cannot generate result: interview session is not completed' ||
                    error.message === 'A result already exists for this interview session'
                ) {
                    res.status(400).json({ message: error.message });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Generate result error:', error);
            res.status(500).json({ message: 'Failed to generate result' });
        }
    }
}

export default new InterviewResultController();