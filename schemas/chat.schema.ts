import { z } from 'zod';

export const sendChatMessageSchema = z.object({
    content: z.string().min(1, 'Message content is required').max(500, 'Message is too long (max 500 characters)'),
});