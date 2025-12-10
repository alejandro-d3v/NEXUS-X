import { AIGenerationRequest, AIGenerationResponse, AIProvider } from '../types';
import openaiService from './openai.service';
import geminiService from './gemini.service';
import ollamaService from './ollama.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AIService {
  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    switch (request.provider) {
      case AIProvider.OPENAI:
        return await openaiService.generate(request);
      case AIProvider.GEMINI:
        return await geminiService.generate(request);
      case AIProvider.OLLAMA:
        return await ollamaService.generate(request);
      default:
        throw new Error('Invalid AI provider');
    }
  }

  async chatWithBot(provider: string, conversationHistory: ChatMessage[]): Promise<string> {
    try {
      switch (provider) {
        case 'OPENAI':
          return await openaiService.chat(conversationHistory);
        case 'GEMINI':
          return await geminiService.chat(conversationHistory);
        case 'OLLAMA':
          return await ollamaService.chat(conversationHistory);
        default:
          throw new Error('Invalid AI provider');
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      throw new Error(`Error chatting with ${provider}: ${error.message}`);
    }
  }
}

export default new AIService();
