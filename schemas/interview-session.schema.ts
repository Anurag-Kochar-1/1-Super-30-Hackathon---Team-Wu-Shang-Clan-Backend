import { z } from 'zod';

export const createInterviewSessionSchema = z.object({
    interviewId: z.string().uuid('Invalid interview ID'),
});

export const updateInterviewSessionSchema = z.object({
    isCameraOn: z.boolean().optional(),
    isMicOn: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});