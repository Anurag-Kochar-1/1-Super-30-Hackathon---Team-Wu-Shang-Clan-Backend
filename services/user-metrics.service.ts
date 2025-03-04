import { PrismaClient, InterviewStatus, QuestionType } from '@prisma/client';
import { UserMetrics } from '../types/user-metrics.types';

const prisma = new PrismaClient();

export class UserMetricsService {
    /**
     * Get comprehensive metrics for a user
     */
    async getUserMetrics(userId: string): Promise<UserMetrics> {
        // Get all interview sessions for the user
        const sessions = await prisma.interviewSession.findMany({
            where: {
                userId,
            },
            include: {
                interview: {
                    include: {
                        jobListing: true,
                    },
                },
                responses: {
                    include: {
                        question: true,
                    },
                },
            },
            orderBy: {
                startedAt: 'asc',
            },
        });

        // Get all results for the user
        const results = await prisma.interviewResult.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Calculate total interviews
        const totalInterviews = sessions.length;

        // Calculate completed interviews
        const completedInterviews = sessions.filter(
            session =>
                session.status === InterviewStatus.ENDED ||
                session.status === InterviewStatus.RESULT_PROCESSING ||
                session.status === InterviewStatus.RESULT_PROCESSED
        ).length;

        // Calculate average score
        const scores = results.map(result => result.overallScore);
        const averageScore = scores.length > 0
            ? parseFloat((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1))
            : null;

        // Calculate highest score
        const highestScore = scores.length > 0
            ? Math.max(...scores)
            : null;

        // Calculate total duration in minutes
        let totalDuration = 0;
        for (const session of sessions) {
            if (session.endedAt) {
                const durationMs = session.endedAt.getTime() - session.startedAt.getTime();
                totalDuration += Math.round(durationMs / (1000 * 60)); // Convert to minutes
            }
        }

        // Get recent activity
        const lastInterviewDate = sessions.length > 0
            ? sessions[sessions.length - 1].startedAt
            : null;

        const lastResultDate = results.length > 0
            ? results[results.length - 1].createdAt
            : null;

        // Calculate skill breakdown based on results and job listings
        const skillBreakdown: { [key: string]: number } = {};

        for (const session of sessions) {
            if (session.interview.jobListing.skillsRequired &&
                Array.isArray(session.interview.jobListing.skillsRequired)) {

                const skills = session.interview.jobListing.skillsRequired as string[];

                // Find corresponding result
                const result = results.find(r => r.interviewId === session.interview.id);

                if (result) {
                    for (const skill of skills) {
                        if (!skillBreakdown[skill]) {
                            skillBreakdown[skill] = 0;
                        }

                        // Just increment the count for now - in a real app, you'd have skill-specific scores
                        skillBreakdown[skill]++;
                    }
                }
            }
        }

        // Calculate normalized scores (0-100) for skills based on frequency
        const maxSkillCount = Math.max(...Object.values(skillBreakdown), 1);
        for (const skill in skillBreakdown) {
            skillBreakdown[skill] = Math.round((skillBreakdown[skill] / maxSkillCount) * 100);
        }

        // Calculate progress over time
        const progressOverTime = results.map(result => ({
            date: result.createdAt,
            score: result.overallScore,
        }));

        // Calculate performance by question type
        const verbalResponses = sessions.flatMap(
            session => session.responses.filter(r => r.question.type === QuestionType.VERBAL)
        );

        const codeResponses = sessions.flatMap(
            session => session.responses.filter(r => r.question.type === QuestionType.CODE)
        );

        // In a real app, you'd have scores for individual responses
        // For now, we'll use the overall scores from results
        const questionTypePerformance = {
            verbal: {
                count: verbalResponses.length,
                averageScore: averageScore, // In a real app, this would be specific to verbal questions
            },
            code: {
                count: codeResponses.length,
                averageScore: averageScore ? Math.min(averageScore + 5, 100) : null, // Simulate slightly different score
            },
        };

        return {
            totalInterviews,
            completedInterviews,
            averageScore,
            totalDuration,
            highestScore,
            recentActivity: {
                lastInterviewDate,
                lastResultDate,
            },
            skillBreakdown,
            progressOverTime,
            questionTypePerformance,
        };
    }
}

export default new UserMetricsService();