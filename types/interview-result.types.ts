import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: User;
}

export interface GenerateResultDto {
    interviewSessionId: string;
}

export interface InterviewResultWithDetails {
    id: string;
    overallScore: number;
    performanceSummary: string;
    detailedFeedback: string;
    contentRelevanceScore: number;
    communicationSkillScore: number;
    technicalCompetenceScore: number | null;
    problemSolvingScore: number | null;
    responseConsistencyScore: number;
    depthOfResponseScore: number;
    criticalThinkingScore: number;
    behavioralCompetencyScore: number;
    createdAt: Date;
    interview: {
        id: string;
        title: string;
        jobListing: {
            id: string;
            title: string;
            company: string;
        };
    };
    metrics: {
        id: string;
        name: string;
        score: number;
        description: string | null;
    }[];
}