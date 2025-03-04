import { Request } from 'express';
import { User, QuestionType } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface SubmitResponseDto {
  questionId: string;
  content?: string;
  codeResponse?: string;
  responseTime?: number;
}

export interface QuestionWithDetails {
  id: string;
  content: string;
  type: QuestionType;
  order: number;
  codeSnippet: string | null;
  expectedAnswer: string | null;
}

export interface ResponseWithDetails {
  id: string;
  content: string;
  codeResponse: string | null;
  responseTime: number | null;
  createdAt: Date;
  questionId: string;
  question: {
    id: string;
    content: string;
    type: QuestionType;
    order: number;
    codeSnippet: string | null;
  };
}