import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: User;
}

export interface UserMetrics {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number | null;
    totalDuration: number;
    highestScore: number | null;
    recentActivity: {
        lastInterviewDate: Date | null;
        lastResultDate: Date | null;
    };
    skillBreakdown: {
        [key: string]: number;
    };
    progressOverTime: {
        date: Date;
        score: number;
    }[];
    questionTypePerformance: {
        verbal: {
            count: number;
            averageScore: number | null;
        };
        code: {
            count: number;
            averageScore: number | null;
        };
    };
}