import express from 'express';
import jobListingController from '../controllers/job-listing.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createJobListingSchema } from '../schemas/job-listing.schema';

const router = express.Router();

router.use(authenticate);

router.post(
    '/',
    validateRequest(createJobListingSchema),
    jobListingController.createJobListing
);

router.get('/', jobListingController.getAllJobListings);

router.get('/:id', jobListingController.getJobListingById);

export default router;