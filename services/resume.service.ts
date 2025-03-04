import { PrismaClient, Resume } from '@prisma/client';
import { CreateResumeDto, UpdateResumeDto } from '../types/resume.types';

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
        // TODO: AI
        return prisma.resume.create({
            data: {
                userId,
                title: resumeData.title,
                totalExperience: resumeData.totalExperience,
                skills: JSON.stringify(resumeData.skills),
                workExperience: JSON.stringify(resumeData.workExperience),
                projects: JSON.stringify(resumeData.projects),
                education: JSON.stringify(resumeData.education) || "",
                certifications: JSON.stringify(resumeData.certifications) || "",
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