import { PrismaClient, ChatMessage, InterviewStatus } from '@prisma/client';
import { SendChatMessageDto } from '../types/chat.types';

const prisma = new PrismaClient();

export class ChatService {
  /**
   * Send a chat message
   */
  async sendChatMessage(
    sessionId: string,
    userId: string,
    messageData: SendChatMessageDto
  ): Promise<ChatMessage> {
    // Check if the session exists and belongs to the user
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new Error('Interview session not found or not owned by user');
    }

    // Check if the session is in a valid state for chat messages
    if (
      session.status === InterviewStatus.RESULT_PROCESSING ||
      session.status === InterviewStatus.RESULT_PROCESSED
    ) {
      throw new Error('Cannot send message: interview session has completed');
    }

    // Create the chat message
    const message = await prisma.chatMessage.create({
      data: {
        interviewSessionId: sessionId,
        content: messageData.content,
        isFromUser: true,
      },
    });

    // If this is one of the first messages, simulate an AI response
    const messageCount = await prisma.chatMessage.count({
      where: {
        interviewSessionId: sessionId,
      },
    });

    if (messageCount <= 2) {
      // Simulate a delay for the AI response
      setTimeout(async () => {
        try {
          await this.generateAIResponse(sessionId, messageData.content);
        } catch (error) {
          console.error('Error generating AI response:', error);
        }
      }, 1000);
    }

    return message;
  }

  /**
   * Generate AI response (mock implementation)
   */
  private async generateAIResponse(sessionId: string, userMessage: string): Promise<ChatMessage> {
    // Simple response generation based on user message
    let aiResponse = 'I understand. Could you tell me more about your approach?';

    if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
      aiResponse = 'Hello! I\'m your interview assistant. How can I help you today?';
    } else if (userMessage.toLowerCase().includes('help')) {
      aiResponse = 'I\'m here to help! You can ask for hints on questions or request clarification.';
    } else if (userMessage.toLowerCase().includes('difficult') || userMessage.toLowerCase().includes('hard')) {
      aiResponse = 'It\'s okay to find questions challenging. Take your time and break down the problem step by step.';
    } else if (userMessage.toLowerCase().includes('thanks') || userMessage.toLowerCase().includes('thank you')) {
      aiResponse = 'You\'re welcome! I\'m here to support you throughout this interview process.';
    }

    // Create the AI response message
    return prisma.chatMessage.create({
      data: {
        interviewSessionId: sessionId,
        content: aiResponse,
        isFromUser: false,
      },
    });
  }

  /**
   * Get chat history for a session
   */
  async getChatHistoryBySessionId(sessionId: string, userId: string): Promise<ChatMessage[]> {
    // Check if the session exists and belongs to the user
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new Error('Interview session not found or not owned by user');
    }

    // Get all chat messages for the session
    return prisma.chatMessage.findMany({
      where: {
        interviewSessionId: sessionId,
      },
      orderBy: {
        sentAt: 'asc',
      },
    });
  }
}

export default new ChatService();