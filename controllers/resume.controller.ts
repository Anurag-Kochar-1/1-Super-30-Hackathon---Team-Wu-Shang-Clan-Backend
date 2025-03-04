import { Response } from 'express';
import { AuthRequest, CreateResumeDto, UpdateResumeDto } from '../types/resume.types';
import resumeService from '../services/resume.service';

export class ResumeController {
    async getAllResumes(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const resumes = await resumeService.getAllResumesByUserId(req.user.id);

            res.status(200).json(resumes);
        } catch (error) {
            console.error('Get all resumes error:', error);
            res.status(500).json({ message: 'Failed to get resumes' });
        }
    }

    async getResumeById(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const resumeId = req.params.id;
            const resume = await resumeService.getResumeById(resumeId, req.user.id);

            if (!resume) {
                res.status(404).json({ message: 'Resume not found' });
                return;
            }

            res.status(200).json(resume);
        } catch (error) {
            console.error('Get resume by ID error:', error);
            res.status(500).json({ message: 'Failed to get resume' });
        }
    }

    async createResume(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const resumeData: CreateResumeDto = req.body;
            const newResume = await resumeService.createResume(resumeData, req.user.id);

            res.status(201).json(newResume);
        } catch (error) {
            console.error('Create resume error:', error);
            res.status(500).json({ message: 'Failed to create resume' });
        }
    }

    async deleteResume(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const resumeId = req.params.id;

            try {
                await resumeService.deleteResume(resumeId, req.user.id);
                res.status(204).send();
            } catch (error: any) {
                if (error.message === 'Resume not found or access denied') {
                    res.status(404).json({ message: error.message });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Delete resume error:', error);
            res.status(500).json({ message: 'Failed to delete resume' });
        }
    }
}

export default new ResumeController();