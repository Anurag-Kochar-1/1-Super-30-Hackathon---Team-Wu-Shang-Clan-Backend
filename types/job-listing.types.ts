import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: User;
}

export interface CreateJobListingDto {
    url: string;
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    skillsRequired?: string[];
    experienceRequired?: number;
    jobType?: string;
    salary?: string;
}

export interface UpdateJobListingDto {
    title?: string;
    company?: string;
    location?: string;
    description?: string;
    skillsRequired?: string[];
    experienceRequired?: number;
    jobType?: string;
    salary?: string;
}

export interface ExtractedJobData {
    title: string;
    company: string;
    location?: string;
    description: string;
    skillsRequired: string[];
    experienceRequired: number;
    jobType?: string;
    salary?: string;
}