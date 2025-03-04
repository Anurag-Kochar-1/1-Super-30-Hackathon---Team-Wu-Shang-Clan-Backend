import { User } from '@prisma/client';
import { Request } from 'express';

export interface RegisterUserDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        avatarUrl: string | null;
    };
}

export interface JwtPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Extend Express Request interface to include the user
export interface AuthRequest extends Request {
    user?: User;
}