import { PrismaClient, JobListing } from '@prisma/client';
import { CreateJobListingDto, ExtractedJobData } from '../types/job-listing.types';

const prisma = new PrismaClient();

export class JobListingService {
    /**
     * Get all job listings for a user
     */
    async getAllJobListingsByUserId(userId: string): Promise<JobListing[]> {
        return prisma.interview.findMany({
            where: { userId },
            select: {
                jobListing: true,
            },
            distinct: ['jobListingId'],
            orderBy: {
                createdAt: 'desc',
            },
        }).then(interviews => interviews.map(interview => interview.jobListing));
    }

    /**
     * Get a specific job listing by ID
     */
    async getJobListingById(jobListingId: string): Promise<JobListing | null> {
        return prisma.jobListing.findUnique({
            where: {
                id: jobListingId,
            },
        });
    }

    /**
     * Create a new job listing from URL
     */
    async createJobListing(jobData: CreateJobListingDto): Promise<JobListing> {
        // If we only have a URL, try to extract job information
        if (jobData.url && (!jobData.title || !jobData.company || !jobData.description)) {
            try {
                const extractedData = await this.extractJobDataFromUrl(jobData.url);

                // Merge the extracted data with any provided data
                jobData = {
                    ...jobData,
                    title: jobData.title || extractedData.title,
                    company: jobData.company || extractedData.company,
                    location: jobData.location || extractedData.location,
                    description: jobData.description || extractedData.description,
                    skillsRequired: jobData.skillsRequired || extractedData.skillsRequired,
                    experienceRequired: jobData.experienceRequired || extractedData.experienceRequired,
                    jobType: jobData.jobType || extractedData.jobType,
                    salary: jobData.salary || extractedData.salary,
                };
            } catch (error) {
                console.error('Error extracting job data:', error);
                // If extraction fails, we'll proceed with whatever data we have
            }
        }

        return prisma.jobListing.create({
            data: {
                url: jobData.url,
                title: jobData.title || 'Untitled Job',
                company: jobData.company || 'Unknown Company',
                location: jobData.location,
                description: jobData.description || '',
                skillsRequired: jobData.skillsRequired || [],
                experienceRequired: jobData.experienceRequired || 0,
                jobType: jobData.jobType,
                salary: jobData.salary,
            },
        });
    }

    private async extractJobDataFromUrl(url: string): Promise<ExtractedJobData> {
        // Log the URL for debugging purposes
        console.log(`Received job URL: ${url}`);

        // Generate some randomness to make the dummy data vary slightly
        const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance'];
        const randomJobTypeIndex = Math.floor(Math.random() * jobTypes.length);
        const experienceYears = Math.floor(Math.random() * 5) + 2; // Random between 2-7 years

        // Return dummy data that looks realistic
        return {
            title: 'Senior Full Stack Developer',
            company: 'TechCorp Solutions',
            location: 'San Francisco, CA (Remote)',
            description: `We're looking for a skilled Full Stack Developer to join our growing team. 
        You'll be responsible for developing and maintaining web applications, APIs, and 
        services that power our platform. The ideal candidate has strong experience with 
        modern JavaScript frameworks, RESTful APIs, and cloud infrastructure.
        
        Responsibilities:
        - Build responsive and scalable web applications
        - Work with cross-functional teams to deliver features
        - Write clean, maintainable, and well-tested code
        - Participate in code reviews and technical discussions
        
        Requirements:
        - ${experienceYears}+ years of professional software development experience
        - Strong knowledge of JavaScript/TypeScript, React, and Node.js
        - Experience with SQL databases and REST APIs
        - Familiarity with cloud platforms like AWS or Azure`,
            skillsRequired: [
                'JavaScript',
                'TypeScript',
                'React',
                'Node.js',
                'Express',
                'PostgreSQL',
                'REST API',
                'Git'
            ],
            experienceRequired: experienceYears,
            jobType: jobTypes[randomJobTypeIndex],
            salary: '$120,000 - $150,000'
        };
    }
}

export default new JobListingService();