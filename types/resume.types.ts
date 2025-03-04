import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends Request {
    user?: User;
}

export interface CreateResumeDto {
    title: string;
    totalExperience: number;
    skills: string[];
    workExperience: WorkExperienceItem[];
    projects: ProjectItem[];
    education?: EducationItem[];
    certifications?: CertificationItem[];
}

export interface UpdateResumeDto {
    title?: string;
    totalExperience?: number;
    skills?: string[];
    workExperience?: WorkExperienceItem[];
    projects?: ProjectItem[];
    education?: EducationItem[];
    certifications?: CertificationItem[];
}

export interface WorkExperienceItem {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    technologies: string[];
}

export interface ProjectItem {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
}

export interface EducationItem {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string; // YYYY-MM format
    endDate: string; // YYYY-MM format or "present"
}

export interface CertificationItem {
    name: string;
    issuer: string;
    date: string; // YYYY-MM format
}