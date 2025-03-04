import { Response } from 'express';
import { AuthRequest, CreateInterviewSessionDto, UpdateInterviewSessionDto } from '../types/interview-session.types';
import interviewSessionService from '../services/interview-session.service';

export class InterviewSessionController {
    /**
     * Start a new interview session
     * POST /api/interview-sessions
     */
    async createInterviewSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const sessionData: CreateInterviewSessionDto = req.body;

            try {
                const newSession = await interviewSessionService.createInterviewSession(
                    sessionData,
                    req.user.id
                );
                res.status(201).json(newSession);
            } catch (error: any) {
                if (error.message === 'Interview not found or not owned by user') {
                    res.status(404).json({ message: error.message });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Create interview session error:', error);
            res.status(500).json({ message: 'Failed to create interview session' });
        }
    }

    /**
     * Update interview session state (camera/mic toggles)
     * PUT /api/interview-sessions/:id
     */
    async updateInterviewSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const sessionId = req.params.id;
            const updateData: UpdateInterviewSessionDto = req.body;

            try {
                const updatedSession = await interviewSessionService.updateInterviewSessionState(
                    sessionId,
                    req.user.id,
                    updateData
                );
                res.status(200).json(updatedSession);
            } catch (error: any) {
                if (error.message === 'Interview session not found or not owned by user') {
                    res.status(404).json({ message: error.message });
                } else if (error.message === 'Interview session is already completed and cannot be updated') {
                    res.status(400).json({ message: error.message });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Update interview session error:', error);
            res.status(500).json({ message: 'Failed to update interview session' });
        }
    }

    /**
     * End an interview session
     * PUT /api/interview-sessions/:id/end
     */
    async endInterviewSession(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const sessionId = req.params.id;

            try {
                const endedSession = await interviewSessionService.endInterviewSession(
                    sessionId,
                    req.user.id
                );
                res.status(200).json(endedSession);
            } catch (error: any) {
                if (error.message === 'Interview session not found or not owned by user') {
                    res.status(404).json({ message: error.message });
                } else if (error.message === 'Interview session is already ended') {
                    res.status(400).json({ message: error.message });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('End interview session error:', error);
            res.status(500).json({ message: 'Failed to end interview session' });
        }
    }

    /**
     * Get all interview sessions for current user
     * GET /api/interview-sessions
     */
    async getAllInterviewSessions(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const sessions = await interviewSessionService.getAllInterviewSessionsByUserId(req.user.id);

            res.status(200).json(sessions);
        } catch (error) {
            console.error('Get all interview sessions error:', error);
            res.status(500).json({ message: 'Failed to get interview sessions' });
        }
    }

    /**
     * Get a specific interview session details
     * GET /api/interview-sessions/:id
     */
    async getInterviewSessionById(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const sessionId = req.params.id;
            const session = await interviewSessionService.getInterviewSessionById(sessionId, req.user.id);

            if (!session) {
                res.status(404).json({ message: 'Interview session not found' });
                return;
            }

            res.status(200).json(session);
        } catch (error) {
            console.error('Get interview session by ID error:', error);
            res.status(500).json({ message: 'Failed to get interview session' });
        }
    }
}

export default new InterviewSessionController();