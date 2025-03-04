import { Response } from 'express';
import { AuthRequest } from '../types/question-response.types';
import questionService from '../services/question.service';

export class QuestionController {
  /**
   * Get all questions for an interview
   * GET /api/interviews/:id/questions
   */
  async getQuestionsByInterviewId(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const interviewId = req.params.id;
      
      try {
        const questions = await questionService.getQuestionsByInterviewId(
          interviewId,
          req.user.id
        );
        res.status(200).json(questions);
      } catch (error: any) {
        if (error.message === 'Interview not found or not owned by user') {
          res.status(404).json({ message: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({ message: 'Failed to get questions' });
    }
  }
}

export default new QuestionController();