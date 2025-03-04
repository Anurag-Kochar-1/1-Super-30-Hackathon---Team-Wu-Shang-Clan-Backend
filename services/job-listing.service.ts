import { PrismaClient, JobListing } from '@prisma/client';
import { CreateJobListingDto, ExtractedJobData } from '../types/job-listing.types';
import puppeteer from 'puppeteer';
import { getConvertJobContentToJsonPrompt } from '../utils/prompt';
import { openai } from '../lib/openai';
import { convert } from "html-to-text"

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
        if (jobData.url && (!jobData.title || !jobData.company || !jobData.description)) {
            try {
                const extractedData = await this.convertJobContentToJson(jobData.url);

                console.log(`extractedData 🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦`)
                console.log(extractedData)

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

    private async extractJobContentFromUrl(url: string): Promise<string | Error> {
        console.log(`Received job URL: ${url}`);
        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            await page.waitForSelector('body', { timeout: 5000 });

            const bodyContent = await page.evaluate(() => {
                return document.body.innerHTML;
            });

            console.log(`bodyContent is`)
            console.log(bodyContent)
            return bodyContent;
        } catch (error) {
            console.log(error)
            throw new Error('Failed to extract job content from URL');
        } finally {
            if (browser) {
                await browser.close();
            }
        }

    }

    private async convertJobContentToJson(url: string): Promise<ExtractedJobData> {
        const jobContentHtml = await this.extractJobContentFromUrl(url);
        const jobContentText = convert(jobContentHtml as string, {
            wordwrap: 120
        })

        console.log(`jobContentText for LLM ⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩`)
        console.log(jobContentText)
        console.log(`ENDING jobContentText for LLM ⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩⏩`)

        const prompt = getConvertJobContentToJsonPrompt({ jobData: jobContentText as string });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{
                role: "user", content: prompt
            }],
        });

        const response = completion.choices[0].message.content
        console.log(`🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦🐦`)
        console.log(response)
        console.log(typeof response)

        const trimmedResponse = JSON.parse(response?.replace(/^```json\s*/, "").replace(/\s*```$/, "")!) as ExtractedJobData | undefined
        console.log(`trimmedResponse 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆`)
        console.log(trimmedResponse)
        console.log(typeof trimmedResponse)
        console.log(`trimmedResponse 👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆👆`)

        return trimmedResponse!
    }
}

export default new JobListingService();