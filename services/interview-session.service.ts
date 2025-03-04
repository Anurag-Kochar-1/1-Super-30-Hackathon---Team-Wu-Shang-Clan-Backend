import { PrismaClient, InterviewSession, InterviewStatus } from '@prisma/client';
import { CreateInterviewSessionDto, UpdateInterviewSessionDto } from '../types/interview-session.types';

const prisma = new PrismaClient();

export class InterviewSessionService {
  async getAllInterviewSessionsByUserId(userId: string): Promise<InterviewSession[]> {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      include: {
        interview: {
          select: {
            title: true,
            jobListing: {
              select: {
                title: true,
                company: true,
              },
            },
          },
        },
        _count: {
          select: {
            responses: true,
            chatMessages: true,
          },
        },
      },
    });
  }

  async getInterviewSessionById(sessionId: string, userId: string): Promise<InterviewSession | null> {
    return prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        interview: {
          select: {
            id: true,
            title: true,
            jobListing: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
            questions: {
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                content: true,
                type: true,
                order: true,
                codeSnippet: true,
              },
            },
          },
        },
        chatMessages: {
          orderBy: {
            sentAt: 'asc',
          },
        },
        responses: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  async createInterviewSession(
    sessionData: CreateInterviewSessionDto,
    userId: string
  ): Promise<InterviewSession> {
    const interview = await prisma.interview.findFirst({
      where: {
        id: sessionData.interviewId,
        userId,
      },
    });

    if (!interview) {
      throw new Error('Interview not found or not owned by user');
    }

    // Create the interview session
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        interviewId: sessionData.interviewId,
        status: InterviewStatus.PENDING,
      },
    });

    return this.getInterviewSessionById(session.id, userId) as Promise<InterviewSession>;
  }

  async updateInterviewSessionState(
    sessionId: string,
    userId: string,
    updateData: UpdateInterviewSessionDto
  ): Promise<InterviewSession> {
    // Check if the session exists and belongs to the user
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new Error('Interview session not found or not owned by user');
    }

    // Check if session is in a state that can be updated
    if (session.status === InterviewStatus.RESULT_PROCESSED) {
      throw new Error('Interview session is already completed and cannot be updated');
    }

    // Update the session
    const updatedSession = await prisma.interviewSession.update({
      where: {
        id: sessionId,
      },
      data: updateData,
    });

    return updatedSession;
  }

  async endInterviewSession(sessionId: string, userId: string): Promise<InterviewSession> {
    // Check if the session exists and belongs to the user
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new Error('Interview session not found or not owned by user');
    }

    // Check if session is already ended
    if (
      session.status === InterviewStatus.ENDED ||
      session.status === InterviewStatus.RESULT_PROCESSING ||
      session.status === InterviewStatus.RESULT_PROCESSED
    ) {
      throw new Error('Interview session is already ended');
    }

    // Update the session
    const updatedSession = await prisma.interviewSession.update({
      where: {
        id: sessionId,
      },
      data: {
        endedAt: new Date(),
        status: InterviewStatus.ENDED,
      },
    });

    // Trigger result processing (this would be an asynchronous process in a real app)
    // For now, just update the status to simulate result processing
    setTimeout(async () => {
      try {
        // Update session to show it's processing
        await prisma.interviewSession.update({
          where: { id: sessionId },
          data: { status: InterviewStatus.RESULT_PROCESSING },
        });

        // Wait a bit to simulate processing time
        setTimeout(async () => {
          // Update to completed
          await prisma.interviewSession.update({
            where: { id: sessionId },
            data: { status: InterviewStatus.RESULT_PROCESSED },
          });

          // Here you would also create an interview result
          // This would involve analyzing the responses and generating scores
          // That's beyond the scope of this example but would be implemented in a real app
        }, 5000);
      } catch (error) {
        console.error('Error processing interview results:', error);
      }
    }, 1000);

    return updatedSession;
  }
}

export default new InterviewSessionService();