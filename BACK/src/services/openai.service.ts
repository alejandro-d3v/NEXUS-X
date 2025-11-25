import OpenAI from 'openai';
import { config } from '../config';
import { AIGenerationRequest, AIGenerationResponse } from '../types';
import { AIProvider } from '../types';
import logger from '../config/logger';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://routellm.abacus.ai/v1',
      apiKey: config.ai.openai.apiKey,
    });
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(request.type);
      
      const completion = await this.client.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.prompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const content = JSON.parse(completion.choices[0].message.content || '{}');

      return {
        content,
        tokensUsed: completion.usage?.total_tokens,
        provider: AIProvider.OPENAI,
      };
    } catch (error) {
      logger.error('OpenAI generation error:', error);
      throw new Error('Error generating content with OpenAI');
    }
  }

  private getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      EXAM: 'Eres un asistente educativo experto en crear exámenes. Genera contenido en formato JSON con preguntas, opciones y respuestas correctas.',
      QUIZ: 'Eres un asistente educativo experto en crear cuestionarios. Genera contenido en formato JSON con preguntas cortas y respuestas.',
      SUMMARY: 'Eres un asistente educativo experto en resumir textos. Genera un resumen estructurado en formato JSON.',
      PRESENTATION: 'Eres un asistente educativo experto en crear presentaciones. Genera contenido en formato JSON con diapositivas y puntos clave.',
      EMAIL: 'Eres un asistente educativo experto en redactar correos. Genera un correo profesional en formato JSON.',
      SURVEY: 'Eres un asistente educativo experto en crear encuestas. Genera preguntas de encuesta en formato JSON.',
      RUBRIC: 'Eres un asistente educativo experto en crear rúbricas de evaluación. Genera criterios y niveles en formato JSON.',
      LESSON_PLAN: 'Eres un asistente educativo experto en crear planes de clase. Genera un plan detallado en formato JSON.',
      GAME: 'Eres un asistente educativo experto en crear juegos educativos. Genera contenido de juego en formato JSON.',
      CHATBOT: 'Eres un asistente educativo experto en la materia solicitada. Responde de manera clara y pedagógica en formato JSON.',
      WRITING_CORRECTION: 'Eres un asistente educativo experto en corrección de escritura. Analiza y corrige el texto en formato JSON.',
    };

    return prompts[type] || 'Eres un asistente educativo. Genera contenido en formato JSON.';
  }
}

export default new OpenAIService();
