import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { AIGenerationRequest, AIGenerationResponse } from '../types';
import { AIProvider } from '../types';
import logger from '../config/logger';

class GeminiService {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(config.ai.gemini.apiKey);
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });

      const systemPrompt = this.getSystemPrompt(request.type);
      const fullPrompt = `${systemPrompt}\n\n${request.prompt}\n\nResponde únicamente con JSON válido.`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      const content = JSON.parse(text);

      return {
        content,
        provider: AIProvider.GEMINI,
      };
    } catch (error) {
      logger.error('Gemini generation error:', error);
      throw new Error('Error generating content with Gemini');
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
      WORD_SEARCH: 'Eres un asistente educativo experto en crear sopas de letras educativas. Genera el grid, las palabras y sus posiciones en formato JSON.',
    };

    return prompts[type] || 'Eres un asistente educativo. Genera contenido en formato JSON.';
  }
}

export default new GeminiService();
