import { z } from 'zod';

const workExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
  endDate: z.string().min(1, 'End date is required'), // can be YYYY-MM or "present"
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
});

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  url: z.string().url('Invalid URL').optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}$/, 'Start date must be in YYYY-MM format'),
  endDate: z.string().min(1, 'End date is required'), // can be YYYY-MM or "present"
});

const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().regex(/^\d{4}-\d{2}$/, 'Date must be in YYYY-MM format'),
});

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  totalExperience: z.number().min(0, 'Experience must be a positive number'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  workExperience: z.array(workExperienceSchema).min(1, 'At least one work experience is required'),
  projects: z.array(projectSchema).min(1, 'At least one project is required'),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  totalExperience: z.number().min(0, 'Experience must be a positive number').optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required').optional(),
  workExperience: z.array(workExperienceSchema).min(1, 'At least one work experience is required').optional(),
  projects: z.array(projectSchema).min(1, 'At least one project is required').optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});