import { PrismaClient, Question } from '@prisma/client';

const prisma = new PrismaClient();

export class QuestionService {
  /**
   * Get all questions for an interview
   */
  async getQuestionsByInterviewId(interviewId: string, userId: string): Promise<Question[]> {
    // First check if the interview exists and belongs to the user
    const interview = await prisma.interview.findFirst({
      where: {
        id: interviewId,
        userId,
      },
    });

    if (!interview) {
      throw new Error('Interview not found or not owned by user');
    }

    // Get all questions for the interview
    return prisma.question.findMany({
      where: {
        interviewId,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  /**
   * Get a specific question by ID
   */
  async getQuestionById(questionId: string): Promise<Question | null> {
    return prisma.question.findUnique({
      where: {
        id: questionId,
      },
    });
  }

  /**
   * Check if a question belongs to an interview
   */
  async isQuestionInInterview(questionId: string, interviewId: string): Promise<boolean> {
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        interviewId,
      },
    });

    return !!question;
  }
}

export default new QuestionService();