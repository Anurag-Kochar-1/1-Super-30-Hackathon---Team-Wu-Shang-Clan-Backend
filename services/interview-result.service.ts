import { PrismaClient, InterviewResult, InterviewStatus, QuestionType } from '@prisma/client';
import { GenerateResultDto } from '../types/interview-result.types';

const prisma = new PrismaClient();

export class InterviewResultService {
    async getAllResultsByUserId(userId: string): Promise<InterviewResult[]> {
        return prisma.interviewResult.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
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
            },
        });
    }

    async getResultById(resultId: string, userId: string): Promise<InterviewResult | null> {
        return prisma.interviewResult.findFirst({
            where: {
                id: resultId,
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
                    },
                },
                metrics: true,
            },
        });
    }

    async generateResult(resultData: GenerateResultDto, userId: string): Promise<InterviewResult> {
        // Check if the session exists and belongs to the user
        const session = await prisma.interviewSession.findFirst({
            where: {
                id: resultData.interviewSessionId,
                userId,
            },
            include: {
                interview: {
                    include: {
                        jobListing: true,
                        questions: true,
                    },
                },
                responses: {
                    include: {
                        question: true,
                    },
                },
            },
        });

        if (!session) {
            throw new Error('Interview session not found or not owned by user');
        }

        // Check if session is ended
        if (session.status !== InterviewStatus.ENDED &&
            session.status !== InterviewStatus.RESULT_PROCESSING &&
            session.status !== InterviewStatus.RESULT_PROCESSED) {
            throw new Error('Cannot generate result: interview session is not completed');
        }

        // Check if a result already exists for this session
        const existingResult = await prisma.interviewResult.findFirst({
            where: {
                interviewId: session.interview.id,
                userId,
            },
        });

        if (existingResult) {
            throw new Error('A result already exists for this interview session');
        }

        // Calculate scores based on responses
        const scores = this.calculateScores(session);

        // Create the result
        const result = await prisma.interviewResult.create({
            data: {
                interviewId: session.interview.id,
                userId,
                overallScore: scores.overallScore,
                performanceSummary: scores.performanceSummary,
                detailedFeedback: scores.detailedFeedback,
                contentRelevanceScore: scores.contentRelevanceScore,
                communicationSkillScore: scores.communicationSkillScore,
                technicalCompetenceScore: scores.technicalCompetenceScore,
                problemSolvingScore: scores.problemSolvingScore,
                responseConsistencyScore: scores.responseConsistencyScore,
                depthOfResponseScore: scores.depthOfResponseScore,
                criticalThinkingScore: scores.criticalThinkingScore,
                behavioralCompetencyScore: scores.behavioralCompetencyScore,
                metrics: {
                    create: scores.metrics,
                },
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
                    },
                },
                metrics: true,
            },
        });

        // Update session status
        await prisma.interviewSession.update({
            where: { id: session.id },
            data: { status: InterviewStatus.RESULT_PROCESSED },
        });

        return result;
    }

    /**
     * Calculate scores based on responses
     * This is a mock implementation that generates realistic-looking scores
     */
    private calculateScores(session: any): any {
        // Get responses and questions
        const responses = session.responses || [];
        const questions = session.interview.questions || [];

        // Calculate response rate
        const responseRate = questions.length > 0 ? responses.length / questions.length : 0;

        // Count code questions and responses
        const codeQuestions = questions.filter((q: any) => q.type === QuestionType.CODE);
        const codeResponses = responses.filter((r: any) => r.question.type === QuestionType.CODE);
        const codeResponseRate = codeQuestions.length > 0 ? codeResponses.length / codeQuestions.length : 0;

        // Calculate average response length
        const avgResponseLength = responses.length > 0
            ? responses.reduce((sum: number, r: any) => sum + (r.content?.length || 0), 0) / responses.length
            : 0;

        // Generate base scores (in a real implementation, this would use NLP and pattern matching)
        const contentRelevanceScore = this.generateScore(75, 95); // Higher base score
        const communicationSkillScore = avgResponseLength > 100 ? this.generateScore(70, 90) : this.generateScore(50, 70);
        const technicalCompetenceScore = codeResponseRate > 0 ? this.generateScore(65, 95) : null;
        const problemSolvingScore = codeResponseRate > 0 ? this.generateScore(70, 90) : null;
        const responseConsistencyScore = responseRate > 0.8 ? this.generateScore(80, 95) : this.generateScore(60, 75);
        const depthOfResponseScore = avgResponseLength > 200 ? this.generateScore(75, 95) : this.generateScore(60, 80);
        const criticalThinkingScore = this.generateScore(70, 90);
        const behavioralCompetencyScore = this.generateScore(75, 95);

        // Calculate overall score
        let scoreSum = contentRelevanceScore + communicationSkillScore + responseConsistencyScore +
            depthOfResponseScore + criticalThinkingScore + behavioralCompetencyScore;
        let scoreCount = 6;

        if (technicalCompetenceScore !== null) {
            scoreSum += technicalCompetenceScore;
            scoreCount++;
        }

        if (problemSolvingScore !== null) {
            scoreSum += problemSolvingScore;
            scoreCount++;
        }

        const overallScore = parseFloat((scoreSum / scoreCount).toFixed(1));

        // Generate performance summary
        let performanceLevel;
        if (overallScore >= 90) performanceLevel = "excellent";
        else if (overallScore >= 80) performanceLevel = "very good";
        else if (overallScore >= 70) performanceLevel = "good";
        else if (overallScore >= 60) performanceLevel = "satisfactory";
        else performanceLevel = "needs improvement";

        const performanceSummary = `Your performance in this mock interview was ${performanceLevel}. ` +
            `You demonstrated ${responseRate * 100}% response coverage of the interview questions. ` +
            (codeQuestions.length > 0
                ? `You completed ${codeResponseRate * 100}% of the coding challenges. `
                : '') +
            `Overall, your responses showed ${this.getStrengthsAndWeaknesses(overallScore)}.`;

        // Generate detailed feedback
        const detailedFeedback = `
      Your interview performance analysis:
      
      Content Relevance (${contentRelevanceScore}/100): ${this.getMetricFeedback('contentRelevance', contentRelevanceScore)}
      
      Communication Skills (${communicationSkillScore}/100): ${this.getMetricFeedback('communicationSkill', communicationSkillScore)}
      
      ${technicalCompetenceScore !== null ? `Technical Competence (${technicalCompetenceScore}/100): ${this.getMetricFeedback('technicalCompetence', technicalCompetenceScore)}
      
      ` : ''}${problemSolvingScore !== null ? `Problem Solving (${problemSolvingScore}/100): ${this.getMetricFeedback('problemSolving', problemSolvingScore)}
      
      ` : ''}Response Consistency (${responseConsistencyScore}/100): ${this.getMetricFeedback('responseConsistency', responseConsistencyScore)}
      
      Depth of Response (${depthOfResponseScore}/100): ${this.getMetricFeedback('depthOfResponse', depthOfResponseScore)}
      
      Critical Thinking (${criticalThinkingScore}/100): ${this.getMetricFeedback('criticalThinking', criticalThinkingScore)}
      
      Behavioral Competency (${behavioralCompetencyScore}/100): ${this.getMetricFeedback('behavioralCompetency', behavioralCompetencyScore)}
      
      Next steps: ${this.getNextSteps(overallScore)}
    `;

        // Generate additional metrics
        const metrics = [
            {
                name: "Question Coverage",
                score: responseRate * 100,
                description: `You answered ${responses.length} out of ${questions.length} questions.`,
            },
            {
                name: "Average Response Time",
                score: this.generateScore(70, 90),
                description: "Your average response time was within the expected range.",
            },
            {
                name: "Answer Quality",
                score: this.generateScore(65, 95),
                description: "Based on the specificity and relevance of your answers.",
            },
            {
                name: "Interview Engagement",
                score: this.generateScore(75, 95),
                description: "Based on your active participation throughout the interview.",
            },
        ];

        return {
            overallScore,
            performanceSummary,
            detailedFeedback,
            contentRelevanceScore,
            communicationSkillScore,
            technicalCompetenceScore,
            problemSolvingScore,
            responseConsistencyScore,
            depthOfResponseScore,
            criticalThinkingScore,
            behavioralCompetencyScore,
            metrics,
        };
    }

    /**
     * Generate a random score within a range
     */
    private generateScore(min: number, max: number): number {
        return parseFloat((Math.random() * (max - min) + min).toFixed(1));
    }

    /**
     * Get feedback about strengths and weaknesses
     */
    private getStrengthsAndWeaknesses(score: number): string {
        if (score >= 90) {
            return "excellent understanding of the role requirements and strong technical and communication skills";
        } else if (score >= 80) {
            return "good technical knowledge and communication skills with minor areas for improvement";
        } else if (score >= 70) {
            return "solid foundational knowledge with several areas that could benefit from further development";
        } else if (score >= 60) {
            return "adequate understanding of basic concepts but significant room for improvement in both technical and communication areas";
        } else {
            return "opportunities for growth in multiple areas including technical knowledge, problem-solving, and interview communication";
        }
    }

    /**
     * Get feedback for specific metrics
     */
    private getMetricFeedback(metric: string, score: number): string {
        const feedbackMap: Record<string, string[]> = {
            contentRelevance: [
                "Your answers were highly relevant to the questions and job requirements. You demonstrated excellent understanding of the role.",
                "Your responses were mostly relevant to the questions asked. Continue practicing aligning your answers with job requirements.",
                "Your answers sometimes missed the core of the questions. Focus on understanding what is being asked before responding."
            ],
            communicationSkill: [
                "You communicated clearly and effectively, using professional language and appropriate examples.",
                "Your communication was generally clear. Work on being more concise and structuring your responses better.",
                "Your responses could be more structured and concise. Practice the STAR method for behavioral questions."
            ],
            technicalCompetence: [
                "You demonstrated strong technical knowledge relevant to the position.",
                "Your technical knowledge was satisfactory. Consider deepening your understanding in key areas.",
                "Your technical responses revealed some knowledge gaps. Focus on strengthening core technical concepts."
            ],
            problemSolving: [
                "Your approach to technical problems was methodical and effective.",
                "You showed decent problem-solving ability. Work on verbalizing your thought process more clearly.",
                "Your problem-solving could be more systematic. Practice breaking down complex problems into manageable steps."
            ],
            responseConsistency: [
                "You answered questions consistently throughout the interview, maintaining quality throughout.",
                "Your response quality was somewhat inconsistent. Try to maintain focus throughout longer interviews.",
                "There was significant variation in your response quality. Work on maintaining consistent performance."
            ],
            depthOfResponse: [
                "Your answers provided appropriate depth, with relevant details and examples.",
                "Some of your responses could have been more detailed. Use specific examples to strengthen your answers.",
                "Many of your answers lacked sufficient depth. Remember to provide context, action, and results in your examples."
            ],
            criticalThinking: [
                "You demonstrated excellent critical thinking and analytical skills.",
                "Your critical thinking was adequate. Practice analyzing situations from multiple perspectives.",
                "Your responses could show more analysis and deeper thinking. Ask clarifying questions when needed."
            ],
            behavioralCompetency: [
                "Your behavioral examples effectively demonstrated relevant soft skills and competencies.",
                "Your behavioral responses were adequate. Prepare more varied examples that highlight different strengths.",
                "Your behavioral examples were limited. Prepare a broader range of specific situations that demonstrate key competencies."
            ]
        };

        if (score >= 80) return feedbackMap[metric][0];
        if (score >= 60) return feedbackMap[metric][1];
        return feedbackMap[metric][2];
    }

    /**
     * Get next steps based on overall score
     */
    private getNextSteps(score: number): string {
        if (score >= 90) {
            return "You're well-prepared for real interviews. Continue practicing with more specialized or advanced questions in your field.";
        } else if (score >= 80) {
            return "Focus on refining your responses in the areas mentioned above. Consider practicing with industry-specific questions.";
        } else if (score >= 70) {
            return "Review the feedback for each category and allocate more practice time to your weaker areas. Consider multiple mock interviews.";
        } else if (score >= 60) {
            return "Dedicate significant practice time to both technical skills and interview technique. Use resources like books, courses, and practice problems.";
        } else {
            return "Develop a structured study plan addressing both technical knowledge and interview skills. Consider professional coaching if available.";
        }
    }
}

export default new InterviewResultService();