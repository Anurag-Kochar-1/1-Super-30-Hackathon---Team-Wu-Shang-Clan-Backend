import { PrismaClient, Resume } from '@prisma/client';
import { CreateResumeDto, UpdateResumeDto } from '../types/resume.types';
import { openai } from '../lib/openai';
import { getConvertResumeContentToJsonPrompt } from '../utils/prompt';
import { createResumeSchema_2 } from '../schemas/resume.schema';

const prisma = new PrismaClient();

export class ResumeService {
    async getAllResumesByUserId(userId: string): Promise<Resume[]> {
        return prisma.resume.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getResumeById(resumeId: string, userId: string): Promise<Resume | null> {
        return prisma.resume.findFirst({
            where: {
                id: resumeId,
                userId,
            },
        });
    }

    async createResume(resumeData: CreateResumeDto, userId: string): Promise<Resume> {
        console.log(`resume data: ${resumeData.content}`);
        const resume = {
            "title": resumeData.title,
            "totalExperience": 3,
            "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Zod"],
            "workExperience": [
                {
                    "company": "TechCorp",
                    "position": "Frontend Developer",
                    "startDate": "2020-06",
                    "endDate": "2023-08",
                    "description": "Developed and maintained web applications using React and TypeScript.",
                    "technologies": ["React", "TypeScript", "Redux", "Tailwind CSS"]
                },
                {
                    "company": "DevStart",
                    "position": "Software Engineer",
                    "startDate": "2018-09",
                    "endDate": "2020-05",
                    "description": "Built scalable backend APIs and frontend applications.",
                    "technologies": ["Node.js", "Express", "MongoDB", "React"]
                }
            ],
            "projects": [
                {
                    "name": "Task Manager App",
                    "description": "A full-stack task management application with real-time updates.",
                    "technologies": ["Next.js", "Socket.io", "MongoDB"],
                    "url": "https://taskmanager.example.com"
                },
                {
                    "name": "Portfolio Website",
                    "description": "A personal portfolio website to showcase projects and skills.",
                    "technologies": ["Astro.js", "Tailwind CSS", "TypeScript"],
                    "url": "https://portfolio.example.com"
                }
            ],
            "education": [
                {
                    "institution": "ABC University",
                    "degree": "Bachelor of Science",
                    "fieldOfStudy": "Computer Science",
                    "startDate": "2015-08",
                    "endDate": "2019-05"
                }
            ],
            "certifications": [
                {
                    "name": "AWS Certified Developer",
                    "issuer": "Amazon Web Services",
                    "date": "2021-11"
                }
            ]
        }
        const prompt = getConvertResumeContentToJsonPrompt({ resumeData: resumeData.content });
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{
                role: "user", content: prompt
            }],
        });

        const response = JSON.parse(completion.choices[0].message.content?.replace(/^```json\s*/, "").replace(/\s*```$/, "")!) as Resume | undefined

        return prisma.resume.create({
            data: {
                userId,
                title: resume.title,
                totalExperience: response?.totalExperience || 2,
                skills: response?.skills || [],
                workExperience: response?.workExperience || [],
                projects: response?.projects || [],
                education: response?.education || [],
                certifications: response?.certifications || [],
            },
        });
    }

    async deleteResume(resumeId: string, userId: string): Promise<void> {
        const existingResume = await this.getResumeById(resumeId, userId);

        if (!existingResume) {
            throw new Error('Resume not found or access denied');
        }

        await prisma.resume.delete({
            where: { id: resumeId },
        });
    }
}

export default new ResumeService();