import { z } from 'zod';

export const createInterviewSchema = z.object({
    jobListingId: z.string().uuid('Invalid job listing ID'),
    resumeId: z.string().uuid('Invalid resume ID').optional(),
    title: z.string().min(1, 'Title is required').optional(),
});