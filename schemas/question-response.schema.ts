import { z } from 'zod';

export const submitResponseSchema = z.object({
    questionId: z.string().uuid('Invalid question ID'),
    content: z.string().optional(),
    codeResponse: z.string().optional(),
    responseTime: z.number().int().min(0, 'Response time must be a positive integer').optional(),
}).refine(data => data.content || data.codeResponse, {
    message: 'Either content or codeResponse must be provided',
});