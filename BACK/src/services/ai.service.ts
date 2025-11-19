import { AIGenerationRequest, AIGenerationResponse, AIProvider } from '../types';
import openaiService from './openai.service';
import geminiService from './gemini.service';
import ollamaService from './ollama.service';

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
}

export default new AIService();
