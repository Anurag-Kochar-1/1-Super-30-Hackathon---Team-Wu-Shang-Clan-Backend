import { z } from 'zod';

// Schema for creating a job listing
export const createJobListingSchema = z.object({
    url: z.string().url('Valid URL is required'),
    title: z.string().min(1, 'Title is required').optional(),
    company: z.string().min(1, 'Company is required').optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    skillsRequired: z.array(z.string()).optional(),
    experienceRequired: z.number().min(0, 'Experience must be a positive number').optional(),
    jobType: z.string().optional(),
    salary: z.string().optional(),
});

// Schema for updating a job listing
export const updateJobListingSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    company: z.string().min(1, 'Company is required').optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    skillsRequired: z.array(z.string()).optional(),
    experienceRequired: z.number().min(0, 'Experience must be a positive number').optional(),
    jobType: z.string().optional(),
    salary: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});