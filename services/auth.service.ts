import { PrismaClient, User } from '@prisma/client';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import {
    RegisterUserDto,
    LoginUserDto,
    UpdateUserDto,
    AuthResponse,
    JwtPayload
} from '../types/auth.types';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { JWT_CONFIG } from '../config/jwt.config';

const prisma = new PrismaClient();

export class AuthService {
    async register(userData: RegisterUserDto): Promise<AuthResponse> {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await hashPassword(userData.password);

        const user = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
            },
        });

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
            },
        };
    }

    async login(loginData: LoginUserDto): Promise<AuthResponse> {
        const user = await prisma.user.findUnique({
            where: { email: loginData.email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await comparePassword(
            loginData.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user);

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatarUrl: user.avatarUrl,
            },
        };
    }

    async getUserById(userId: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id: userId },
        });
    }
    async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
        return prisma.user.update({
            where: { id: userId },
            data: userData,
        });
    }


    private generateToken(user: User): string {
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
        };

        const secretKey: Secret = JWT_CONFIG.secretKey
        const options: SignOptions = {
            expiresIn: JWT_CONFIG.expiresIn as any,
        };

        return jwt.sign(payload, secretKey, options);
    }

    verifyToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, JWT_CONFIG.secretKey) as JwtPayload;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

export default new AuthService();