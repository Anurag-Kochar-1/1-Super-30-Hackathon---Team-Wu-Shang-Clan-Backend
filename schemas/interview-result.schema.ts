import { z } from 'zod';

export const generateResultSchema = z.object({
    interviewSessionId: z.string().uuid('Invalid interview session ID'),
});