import { Request } from 'express';
import { User, InterviewStatus } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: User;
}

export interface CreateInterviewSessionDto {
    interviewId: string;
}

export interface UpdateInterviewSessionDto {
    isCameraOn?: boolean;
    isMicOn?: boolean;
}

export interface InterviewSessionWithDetails {
    id: string;
    startedAt: Date;
    endedAt: Date | null;
    status: InterviewStatus;
    isCameraOn: boolean;
    isMicOn: boolean;
    userId: string;
    interviewId: string;
    interview: {
        id: string;
        title: string;
        jobListing: {
            id: string;
            title: string;
            company: string;
        };
    };
    chatMessages: {
        id: string;
        content: string;
        sentAt: Date;
        isFromUser: boolean;
    }[];
    responses: {
        id: string;
        questionId: string;
        content: string;
        codeResponse: string | null;
        responseTime: number | null;
        createdAt: Date;
        question: {
            id: string;
            content: string;
            type: string;
            order: number;
            codeSnippet: string | null;
        };
    }[];
}