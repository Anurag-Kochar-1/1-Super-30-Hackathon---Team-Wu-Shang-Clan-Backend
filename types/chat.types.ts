import { Request } from 'express';
import { User, InterviewStatus } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: User;
}

export interface SendChatMessageDto {
  content: string;
}

export interface ChatMessageWithDetails {
  id: string;
  content: string;
  sentAt: Date;
  isFromUser: boolean;
}