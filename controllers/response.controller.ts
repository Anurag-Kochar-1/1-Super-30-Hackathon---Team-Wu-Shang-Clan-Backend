import { Response } from 'express';
import { AuthRequest, SubmitResponseDto } from '../types/question-response.types';
import responseService from '../services/response.service';

export class ResponseController {
  /**
   * Submit a response to a question
   * POST /api/interview-sessions/:id/responses
   */
  async submitResponse(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const sessionId = req.params.id;
      const responseData: SubmitResponseDto = req.body;
      
      try {
        const newResponse = await responseService.submitResponse(
          sessionId,
          req.user.id,
          responseData
        );
        res.status(201).json(newResponse);
      } catch (error: any) {
        if (
          error.message === 'Interview session not found or not owned by user' ||
          error.message === 'Question not found or not part of this interview' ||
          error.message === 'Question not found'
        ) {
          res.status(404).json({ message: error.message });
        } else if (
          error.message === 'Cannot submit response: interview session has ended' ||
          error.message === 'A response for this question already exists' ||
          error.message === 'Content is required for verbal questions' ||
          error.message === 'Code response is required for code questions'
        ) {
          res.status(400).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Submit response error:', error);
      res.status(500).json({ message: 'Failed to submit response' });
    }
  }

  /**
   * Get all responses for a session
   * GET /api/interview-sessions/:id/responses
   */
  async getResponsesBySessionId(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const sessionId = req.params.id;
      
      try {
        const responses = await responseService.getResponsesBySessionId(
          sessionId,
          req.user.id
        );
        res.status(200).json(responses);
      } catch (error: any) {
        if (error.message === 'Interview session not found or not owned by user') {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Get responses error:', error);
      res.status(500).json({ message: 'Failed to get responses' });
    }
  }
}

export default new ResponseController();