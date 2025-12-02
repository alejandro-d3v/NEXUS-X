import axios from 'axios';
import { config } from '../config';
import { AIGenerationRequest, AIGenerationResponse } from '../types';
import { AIProvider } from '../types';
import logger from '../config/logger';

class OllamaService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = config.ai.ollama.baseUrl;
    this.model = config.ai.ollama.model;
  }

  async generate(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(request.type);

      // Construir el prompt incluyendo el contexto del PDF si existe
      let userPrompt = request.prompt;
      if (request.pdfContext) {
        userPrompt = `
CONTEXTO DEL PDF (${request.pdfFileName || 'documento.pdf'}):
---
${request.pdfContext}
---

INSTRUCCIONES DEL USUARIO:
${request.prompt}

IMPORTANTE: Genera el contenido basándote principalmente en el contenido del PDF proporcionado arriba.
`;
      }

      const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nResponde únicamente con JSON válido.`;

      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        format: 'json',
      });

      const content = JSON.parse(response.data.response);

      return {
        content,
        provider: AIProvider.OLLAMA,
      };
    } catch (error) {
      logger.error('Ollama generation error:', error);
      throw new Error('Error generating content with Ollama');
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

export default new OllamaService();
