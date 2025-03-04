import { Request } from 'express';
import { User, QuestionType } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface CreateInterviewDto {
  jobListingId: string;
  resumeId?: string;
  title?: string;
}

export interface GeneratedQuestion {
  content: string;
  type: QuestionType;
  order: number;
  codeSnippet?: string;
  expectedAnswer?: string;
}

export interface InterviewWithDetails {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  jobListingId: string;
  resumeId: string | null;
  jobListing: {
    id: string;
    title: string;
    company: string;
    description: string;
  };
  resume?: {
    id: string;
    title: string;
  } | null;
  questions: {
    id: string;
    content: string;
    type: QuestionType;
    order: number;
    codeSnippet?: string | null;
    expectedAnswer?: string | null;
  }[];
  interviewSessions: {
    id: string;
    startedAt: Date;
    endedAt: Date | null;
    status: string;
  }[];
}