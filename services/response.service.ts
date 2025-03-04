import { PrismaClient, Response, InterviewStatus, QuestionType } from '@prisma/client';
import { SubmitResponseDto } from '../types/question-response.types';
import questionService from './question.service';

const prisma = new PrismaClient();

export class ResponseService {
    /**
     * Submit a response to a question
     */
    async submitResponse(
        sessionId: string,
        userId: string,
        responseData: SubmitResponseDto
    ): Promise<Response> {
        // Check if the session exists and belongs to the user
        const session = await prisma.interviewSession.findFirst({
            where: {
                id: sessionId,
                userId,
            },
            include: {
                interview: true,
            },
        });

        if (!session) {
            throw new Error('Interview session not found or not owned by user');
        }

        // Check if the session is in a valid state for submitting responses
        if (
            session.status === InterviewStatus.ENDED ||
            session.status === InterviewStatus.RESULT_PROCESSING ||
            session.status === InterviewStatus.RESULT_PROCESSED
        ) {
            throw new Error('Cannot submit response: interview session has ended');
        }

        // Check if the question exists and belongs to the interview
        const isValidQuestion = await questionService.isQuestionInInterview(
            responseData.questionId,
            session.interview.id
        );

        if (!isValidQuestion) {
            throw new Error('Question not found or not part of this interview');
        }

        // Check if a response for this question already exists
        const existingResponse = await prisma.response.findFirst({
            where: {
                interviewSessionId: sessionId,
                questionId: responseData.questionId,
            },
        });

        if (existingResponse) {
            throw new Error('A response for this question already exists');
        }

        // Get the question to validate the response type
        const question = await questionService.getQuestionById(responseData.questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        // Validate response based on question type
        if (question.type === QuestionType.VERBAL && !responseData.content) {
            throw new Error('Content is required for verbal questions');
        }

        if (question.type === QuestionType.CODE && !responseData.codeResponse) {
            throw new Error('Code response is required for code questions');
        }

        // If this is the first response, update session status to ONGOING
        if (session.status === InterviewStatus.PENDING) {
            await prisma.interviewSession.update({
                where: { id: sessionId },
                data: { status: InterviewStatus.ONGOING },
            });
        }

        // Create the response
        return prisma.response.create({
            data: {
                interviewSessionId: sessionId,
                questionId: responseData.questionId,
                content: responseData.content || '',
                codeResponse: responseData.codeResponse || null,
                responseTime: responseData.responseTime || null,
            },
        });
    }

    /**
     * Get all responses for a session
     */
    async getResponsesBySessionId(sessionId: string, userId: string): Promise<Response[]> {
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

        // Get all responses for the session
        return prisma.response.findMany({
            where: {
                interviewSessionId: sessionId,
            },
            include: {
                question: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
}

export default new ResponseService();