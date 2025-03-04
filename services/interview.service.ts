import { PrismaClient, Interview, QuestionType } from '@prisma/client';
import { CreateInterviewDto, GeneratedQuestion } from '../types/interview.types';

const prisma = new PrismaClient();

export class InterviewService {
    async getAllInterviewsByUserId(userId: string): Promise<Interview[]> {
        return prisma.interview.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                jobListing: {
                    select: {
                        title: true,
                        company: true,
                    },
                },
                resume: {
                    select: {
                        title: true,
                    },
                },
                _count: {
                    select: {
                        questions: true,
                        interviewSessions: true,
                    },
                },
            },
        });
    }

    /**
     * Get a specific interview by ID
     */
    async getInterviewById(interviewId: string, userId: string): Promise<Interview | null> {
        return prisma.interview.findFirst({
            where: {
                id: interviewId,
                userId,
            },
            include: {
                jobListing: true,
                resume: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                questions: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                interviewSessions: {
                    orderBy: {
                        startedAt: 'desc',
                    },
                    select: {
                        id: true,
                        startedAt: true,
                        endedAt: true,
                        status: true,
                    },
                },
            },
        });
    }

    /**
     * Create a new interview
     */
    async createInterview(
        interviewData: CreateInterviewDto,
        userId: string
    ): Promise<Interview> {
        // Check if the job listing exists
        const jobListing = await prisma.jobListing.findUnique({
            where: { id: interviewData.jobListingId },
        });

        if (!jobListing) {
            throw new Error('Job listing not found');
        }

        // Check if resume exists if provided
        if (interviewData.resumeId) {
            const resume = await prisma.resume.findFirst({
                where: {
                    id: interviewData.resumeId,
                    userId,
                },
            });

            if (!resume) {
                throw new Error('Resume not found or not owned by user');
            }
        }

        // Create the interview
        const interview = await prisma.interview.create({
            data: {
                title: interviewData.title || `${jobListing.title} Interview`,
                userId,
                jobListingId: interviewData.jobListingId,
                resumeId: interviewData.resumeId,
            },
        });

        // Generate questions based on job listing and resume
        const questions = await this.generateInterviewQuestions(
            jobListing.id,
            interviewData.resumeId,
            userId
        );

        // Create the questions in the database
        await Promise.all(
            questions.map((question) =>
                prisma.question.create({
                    data: {
                        interviewId: interview.id,
                        content: question.content,
                        type: question.type,
                        order: question.order,
                        codeSnippet: question.codeSnippet,
                        expectedAnswer: question.expectedAnswer,
                    },
                })
            )
        );

        // Return the complete interview
        return this.getInterviewById(interview.id, userId) as Promise<Interview>;
    }

    /**
     * Generate interview questions based on job listing and resume
     * This is a placeholder with dummy questions. In a real implementation,
     * you would use OpenAI API or similar to generate relevant questions.
     */
    private async generateInterviewQuestions(
        jobListingId: string,
        resumeId?: string,
        userId?: string
    ): Promise<GeneratedQuestion[]> {
        // Get job listing details
        const jobListing = await prisma.jobListing.findUnique({
            where: { id: jobListingId },
        });

        if (!jobListing) {
            throw new Error('Job listing not found');
        }

        // Get resume details if provided
        let resume = null;
        if (resumeId && userId) {
            resume = await prisma.resume.findFirst({
                where: {
                    id: resumeId,
                    userId,
                },
            });
        }

        // For now, generate dummy questions
        // In a real implementation, you would analyze the job listing and resume
        // to generate relevant questions using OpenAI API or similar
        const questions: GeneratedQuestion[] = [
            {
                content: "Tell me about your experience with the technologies mentioned in your resume.",
                type: QuestionType.VERBAL,
                order: 1,
            },
            {
                content: `The job description for ${jobListing.title} mentions team collaboration. Can you describe a situation where you worked effectively in a team?`,
                type: QuestionType.VERBAL,
                order: 2,
            },
            {
                content: "What interests you most about this position?",
                type: QuestionType.VERBAL,
                order: 3,
            },
            {
                content: "How do you handle tight deadlines and pressure?",
                type: QuestionType.VERBAL,
                order: 4,
            },
            {
                content: "Write a function that finds the maximum value in an array of integers.",
                type: QuestionType.CODE,
                order: 5,
                codeSnippet: "function findMax(arr) {\n  // Your code here\n}",
                expectedAnswer: "function findMax(arr) {\n  return Math.max(...arr);\n}",
            },
        ];

        // If the job listing has specific skills required, add relevant technical questions
        if (
            jobListing.skillsRequired &&
            Array.isArray(jobListing.skillsRequired) &&
            (jobListing.skillsRequired as string[]).length > 0
        ) {
            const skills = jobListing.skillsRequired as string[];

            if (skills.includes('React')) {
                questions.push({
                    content: "Explain the concept of virtual DOM in React and why it's important.",
                    type: QuestionType.VERBAL,
                    order: 6,
                });
            }

            if (skills.includes('JavaScript') || skills.includes('TypeScript')) {
                questions.push({
                    content: "Write a function that returns a Promise which resolves after a specified delay.",
                    type: QuestionType.CODE,
                    order: 7,
                    codeSnippet: "function delay(ms) {\n  // Your code here\n}",
                    expectedAnswer: "function delay(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}",
                });
            }

            if (skills.includes('Node.js')) {
                questions.push({
                    content: "Describe the event loop in Node.js and how it enables non-blocking I/O operations.",
                    type: QuestionType.VERBAL,
                    order: 8,
                });
            }
        }

        return questions;
    }
}

export default new InterviewService();