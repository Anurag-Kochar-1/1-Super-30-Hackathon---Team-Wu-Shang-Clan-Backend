import { Response } from 'express';
import { AuthRequest, CreateInterviewDto } from '../types/interview.types';
import interviewService from '../services/interview.service';

export class InterviewController {
  async createInterview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const interviewData: CreateInterviewDto = req.body;
      
      try {
        const newInterview = await interviewService.createInterview(
          interviewData,
          req.user.id
        );
        res.status(201).json(newInterview);
      } catch (error: any) {
        if (
          error.message === 'Job listing not found' ||
          error.message === 'Resume not found or not owned by user'
        ) {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Create interview error:', error);
      res.status(500).json({ message: 'Failed to create interview' });
    }
  }

  /**
   * Get all interviews for current user
   * GET /api/interviews
   */
  async getAllInterviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const interviews = await interviewService.getAllInterviewsByUserId(req.user.id);
      
      res.status(200).json(interviews);
    } catch (error) {
      console.error('Get all interviews error:', error);
      res.status(500).json({ message: 'Failed to get interviews' });
    }
  }

  /**
   * Get a specific interview
   * GET /api/interviews/:id
   */
  async getInterviewById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const interviewId = req.params.id;
      const interview = await interviewService.getInterviewById(interviewId, req.user.id);
      
      if (!interview) {
        res.status(404).json({ message: 'Interview not found' });
        return;
      }
      
      res.status(200).json(interview);
    } catch (error) {
      console.error('Get interview by ID error:', error);
      res.status(500).json({ message: 'Failed to get interview' });
    }
  }
}

export default new InterviewController();