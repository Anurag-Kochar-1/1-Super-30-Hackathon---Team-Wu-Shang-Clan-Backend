import { Response } from 'express';
import { AuthRequest, SendChatMessageDto } from '../types/chat.types';
import chatService from '../services/chat.service';

export class ChatController {
    /**
     * Send a chat message
     * POST /api/interview-sessions/:id/chat
     */
    async sendChatMessage(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const sessionId = req.params.id;
            const messageData: SendChatMessageDto = req.body;

            try {
                const message = await chatService.sendChatMessage(
                    sessionId,
                    req.user.id,
                    messageData
                );
                res.status(201).json(message);
            } catch (error: any) {
                if (error.message === 'Interview session not found or not owned by user') {
                    res.status(404).json({ message: error.message });
                } else if (error.message === 'Cannot send message: interview session has completed') {
                    res.status(400).json({ message: error.message });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Send chat message error:', error);
            res.status(500).json({ message: 'Failed to send chat message' });
        }
    }

    /**
     * Get chat history for a session
     * GET /api/interview-sessions/:id/chat
     */
    async getChatHistory(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ message: 'Not authenticated' });
                return;
            }

            const sessionId = req.params.id;

            try {
                const messages = await chatService.getChatHistoryBySessionId(
                    sessionId,
                    req.user.id
                );
                res.status(200).json(messages);
            } catch (error: any) {
                if (error.message === 'Interview session not found or not owned by user') {
                    res.status(404).json({ message: error.message });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Get chat history error:', error);
            res.status(500).json({ message: 'Failed to get chat history' });
        }
    }
}

export default new ChatController();