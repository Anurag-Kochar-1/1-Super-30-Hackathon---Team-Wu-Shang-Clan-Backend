import { PrismaClient, Interview, QuestionType, Resume, JobListing } from '@prisma/client';
import { CreateInterviewDto, GeneratedQuestion } from '../types/interview.types';
import { getGenerateInterviewQuestionsPrompt } from '../utils/prompt';
import { openai } from '../lib/openai';

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

    async createInterview(
        interviewData: CreateInterviewDto,
        userId: string
    ): Promise<Interview> {
        const jobListing = await prisma.jobListing.findUnique({
            where: { id: interviewData.jobListingId },
        });

        let resume

        if (!jobListing) {
            throw new Error('Job listing not found');
        }

        if (interviewData.resumeId) {
            console.log(interviewData.resumeId)
            console.log(userId)
            resume = await prisma.resume.findFirst({
                where: {
                    id: interviewData.resumeId,
                    // TODO
                    // userId,
                },
            });

            if (!resume) {
                throw new Error('Resume not found or not owned by user');
            }
        }

        const interview = await prisma.interview.create({
            data: {
                title: interviewData.title || `${jobListing.title} Mock Interview`,
                userId,
                jobListingId: interviewData.jobListingId,
                resumeId: interviewData.resumeId,
            },
        });

        const questions = await this.generateInterviewQuestions(
            jobListing,
            resume!,
            userId
        );

        await Promise.all(
            questions.map((question) =>
                prisma.question.create({
                    data: {
                        interviewId: interview.id,
                        content: question.content,
                        type: question.type,
                        order: question.order,
                        codeSnippet: question?.codeSnippet,
                        expectedAnswer: question.expectedAnswer ?? "",
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
        jobListingData: JobListing,
        resume: Resume,
        userId?: string
    ): Promise<GeneratedQuestion[]> {
        const prompt = getGenerateInterviewQuestionsPrompt({ jobData: JSON.stringify(jobListingData), resumeData: JSON.stringify(resume) })
        console.log(`generating questions with prompt: ${prompt}`);
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{
                role: "user", content: prompt
            }],
        });

        console.log(`response from openai 👇👇👇`);


        console.log(response?.choices[0].message.content);
        const questions = JSON.parse(response.choices[0].message.content?.replace(/^```json\s*/, "").replace(/\s*```$/, "")!) as GeneratedQuestion[] | undefined

        console.log(`question😁😁`)
        console.log(questions)
        console.log(typeof questions)
        console.log(`question😁😁`)


        // const dummyQuestions: GeneratedQuestion[] = [
        //     {
        //         content: "Tell me about your experience with the technologies mentioned in your resume.",
        //         type: QuestionType.VERBAL,
        //         order: 1,
        //     },
        //     {
        //         content: `The job description for ${jobListingData.title} mentions team collaboration. Can you describe a situation where you worked effectively in a team?`,
        //         type: QuestionType.VERBAL,
        //         order: 2,
        //     },
        //     {
        //         content: "What interests you most about this position?",
        //         type: QuestionType.VERBAL,
        //         order: 3,
        //     },
        //     {
        //         content: "How do you handle tight deadlines and pressure?",
        //         type: QuestionType.VERBAL,
        //         order: 4,
        //     },
        //     {
        //         content: "Write a function that finds the maximum value in an array of integers.",
        //         type: QuestionType.CODE,
        //         order: 5,
        //         codeSnippet: "function findMax(arr) {\n  // Your code here\n}",
        //         expectedAnswer: "function findMax(arr) {\n  return Math.max(...arr);\n}",
        //     },
        // ];

        // if (
        //     jobListingData.skillsRequired &&
        //     Array.isArray(jobListingData.skillsRequired) &&
        //     (jobListingData.skillsRequired as string[]).length > 0
        // ) {
        //     const skills = jobListingData.skillsRequired as string[];

        //     if (skills.includes('React')) {
        //         questions.push({
        //             content: "Explain the concept of virtual DOM in React and why it's important.",
        //             type: QuestionType.VERBAL,
        //             order: 6,
        //         });
        //     }

        //     if (skills.includes('JavaScript') || skills.includes('TypeScript')) {
        //         questions.push({
        //             content: "Write a function that returns a Promise which resolves after a specified delay.",
        //             type: QuestionType.CODE,
        //             order: 7,
        //             codeSnippet: "function delay(ms) {\n  // Your code here\n}",
        //             expectedAnswer: "function delay(ms) {\n  return new Promise(resolve => setTimeout(resolve, ms));\n}",
        //         });
        //     }

        //     if (skills.includes('Node.js')) {
        //         questions.push({
        //             content: "Describe the event loop in Node.js and how it enables non-blocking I/O operations.",
        //             type: QuestionType.VERBAL,
        //             order: 8,
        //         });
        //     }
        // }

        return questions!;
    }
}

export default new InterviewService();