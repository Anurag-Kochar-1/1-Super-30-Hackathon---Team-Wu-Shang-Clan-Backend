import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateRequest = (schema: z.ZodType<any, any>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Return validation errors
                res.status(400).json({
                    message: 'Validation failed',
                    errors: error.errors,
                });
                return;
            }
            // Handle unexpected errors
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
    };
};

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string({ required_error: "First name is required" }),
    lastName: z.string({ required_error: "Last name is required" }),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Update user validation schema
export const updateUserSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatarUrl: z.string().url('Invalid URL').optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});