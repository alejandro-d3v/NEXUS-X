import { Request, Response } from 'express';
import aiService from '../services/ai.service';
import prisma from '../config/database';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// In-memory conversation storage (in production, use Redis or database)
const conversationHistory: Map<string, ChatMessage[]> = new Map();

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const { message } = req.body;
    const userId = (req as any).userId;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get activity details
    const activity = await prisma.activity.findUnique({
      where: { id: activityId }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    if (activity.type !== 'CHATBOT') {
      return res.status(400).json({ error: 'Activity is not a chatbot' });
    }

    // Parse chatbot configuration
    const config = typeof activity.content === 'string' 
      ? JSON.parse(activity.content) 
      : activity.content;

    // Get or initialize conversation history for this user + activity
    const conversationKey = `${userId}-${activityId}`;
    let history = conversationHistory.get(conversationKey) || [];

    // If this is the first message, add system prompt and welcome message
    if (history.length === 0) {
      history.push({
        role: 'system',
        content: config.systemPrompt || `Eres un experto en ${config.topic}. Responde SOLO preguntas sobre este tema.`
      });
      
      if (config.welcomeMessage) {
        history.push({
          role: 'assistant',
          content: config.welcomeMessage
        });
      }
    }

    // Add user message to history
    history.push({
      role: 'user',
      content: message
    });

    // Call AI service with conversation history
    const response = await aiService.chatWithBot(
      activity.aiProvider,
      history
    );

    // Add assistant response to history
    history.push({
      role: 'assistant',
      content: response
    });

    // Update conversation history (keep last 20 messages to avoid memory issues)
    if (history.length > 22) { // 1 system + 1 welcome + 20 conversation messages
      history = [history[0], history[1], ...history.slice(-20)];
    }
    conversationHistory.set(conversationKey, history);

    return res.json({
      message: response,
      conversationLength: history.length - 2 // Exclude system and welcome
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'Error processing message' });
  }
};

export const clearConversation = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const userId = (req as any).userId;

    const conversationKey = `${userId}-${activityId}`;
    conversationHistory.delete(conversationKey);

    return res.json({ message: 'Conversation cleared successfully' });
  } catch (error: any) {
    console.error('Clear conversation error:', error);
    return res.status(500).json({ error: error.message || 'Error clearing conversation' });
  }
};

export const getConversationHistory = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const userId = (req as any).userId;

    const conversationKey = `${userId}-${activityId}`;
    const history = conversationHistory.get(conversationKey) || [];

    // Filter out system message
    const userHistory = history.filter(msg => msg.role !== 'system');

    return res.json({ history: userHistory });
  } catch (error: any) {
    console.error('Get history error:', error);
    return res.status(500).json({ error: error.message || 'Error getting history' });
  }
};
