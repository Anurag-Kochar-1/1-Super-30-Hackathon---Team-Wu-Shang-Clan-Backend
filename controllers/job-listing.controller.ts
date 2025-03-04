import { Response } from 'express';
import { AuthRequest, CreateJobListingDto } from '../types/job-listing.types';
import jobListingService from '../services/job-listing.service';

export class JobListingController {
    async createJobListing(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const jobData: CreateJobListingDto = req.body;

            try {
                const newJobListing = await jobListingService.createJobListing(jobData);

                
                res.status(201).json(newJobListing);
            } catch (error: any) {
                if (error.message === 'Failed to extract job data from URL') {
                    res.status(422).json({
                        message: 'Could not extract job data from the provided URL. Please provide job details manually.'
                    });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Create job listing error:', error);
            res.status(500).json({ message: 'Failed to create job listing' });
        }
    }


    async getAllJobListings(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const jobListings = await jobListingService.getAllJobListingsByUserId(req.user.id);

            res.status(200).json(jobListings);
        } catch (error) {
            console.error('Get all job listings error:', error);
            res.status(500).json({ message: 'Failed to get job listings' });
        }
    }

    async getJobListingById(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const jobListingId = req.params.id;
            const jobListing = await jobListingService.getJobListingById(jobListingId);

            if (!jobListing) {
                res.status(404).json({ message: 'Job listing not found' });
                return;
            }

            res.status(200).json(jobListing);
        } catch (error) {
            console.error('Get job listing by ID error:', error);
            res.status(500).json({ message: 'Failed to get job listing' });
        }
    }
}

export default new JobListingController();