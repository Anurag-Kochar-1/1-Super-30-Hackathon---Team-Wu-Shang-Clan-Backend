import { Request, Response } from 'express';
import { AuthRequest, RegisterUserDto, LoginUserDto, UpdateUserDto } from '../types/auth.types';
import authService from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterUserDto = req.body;
      const result = await authService.register(userData);
      
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user' });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginUserDto = req.body;
      const result = await authService.login(loginData);
      
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        res.status(401).json({ message: error.message });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Failed to login' });
      }
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      // User is already attached to request by auth middleware
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = req.user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ message: 'Failed to get user profile' });
    }
  }


  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }
      
      const userData: UpdateUserDto = req.body;
      const updatedUser = await authService.updateUser(req.user.id, userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
}

export default new AuthController();