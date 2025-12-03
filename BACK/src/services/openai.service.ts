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

      // Construir el prompt del usuario según el tipo de actividad
      let userPrompt = request.prompt;
      if (request.type === 'EXAM' && request.additionalParams) {
        userPrompt = this.buildExamPrompt(request);
      } else if (request.type === 'FLASHCARDS' && request.additionalParams) {
        userPrompt = this.buildFlashcardsPrompt(request);
      }

      const completion = await this.client.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
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

  private buildExamPrompt(request: AIGenerationRequest): string {
    const examTemplate = require('../templates/exam.json');
    const params = (request.additionalParams || {}) as any;

    // Construir el contexto base
    let contextualPrompt = '';

    if (request.pdfContext) {
      // Si hay PDF, usarlo como contexto principal
      contextualPrompt = `
### Contenido del PDF (usar como base del examen):

Archivo: ${request.pdfFileName || 'documento.pdf'}

${request.pdfContext}

### Instrucciones adicionales del usuario:
${request.prompt}
`;
    } else {
      // Sin PDF, usar el prompt normal
      contextualPrompt = `
### Contexto para el examen:
${request.prompt}
`;
    }

    return `
Genera un examen en formato JSON utilizando la siguiente estructura fija:

${JSON.stringify(examTemplate, null, 2)}

Rellena todos los campos con contenido original y educativo.

${contextualPrompt}

### Parámetros del examen:

Título: ${params.titulo || request.prompt}
Descripción: ${params.descripcion || ''}
Materia: ${params.materia || request.subject}
Nivel educativo: ${params.nivelEducativo || request.grade}
Idioma: ${params.idioma || 'Español'}
Duración: ${params.duracion || 60} minutos
Dificultad: ${params.dificultad || 'media'}

Cantidad total de preguntas: ${params.cantidadPreguntas || 10}
Cantidad de opción múltiple: ${params.cantidadOM || 5}
Cantidad de verdadero/falso: ${params.cantidadVF || 5}

### Reglas:

- Usa exclusivamente la estructura JSON proporcionada.
- No cambies nombres de claves.
- No añadas campos nuevos.
- Las preguntas pueden ser creativas pero deben ser apropiadas al nivel educativo.
- Para opción múltiple, incluye exactamente 4 opciones.
- Para VF, la respuesta_correcta debe ser true o false (boolean).
- Todas las preguntas deben estar numeradas correctamente (1, 2, 3, etc.).
- No escribas explicación, solo JSON puro.
- Puedes enriquecer enunciados de manera flexible, pero sin romper el formato.
- El índice de respuesta_correcta en opción múltiple debe ser un número del 0 al 3.
${request.pdfContext ? '- IMPORTANTE: Todas las preguntas deben basarse en el contenido del PDF proporcionado.' : ''}

${params.instruccionesAdicionales || ''}
    `.trim();
  }

  private buildFlashcardsPrompt(request: AIGenerationRequest): string {
    const flashcardTemplate = require('../templates/flashcard.json');
    const params = (request.additionalParams || {}) as any;

    return `
Genera tarjetas de estudio (flashcards) en formato JSON utilizando la siguiente estructura fija:

${JSON.stringify(flashcardTemplate, null, 2)}

Rellena todos los campos con contenido original y educativo.

### Contexto:
${request.prompt}

### Parámetros de las tarjetas:

Título: ${params.titulo || request.prompt}
Descripción: ${params.descripcion || ''}
Nivel educativo: ${params.nivelEducativo || request.grade}
Cantidad de tarjetas: ${params.cantidadTarjetas || 10}
Tipo: ${params.tipo || 'Definiciones'}
Estilo: ${params.estilo || 'Conciso'}

### Reglas:

- Usa exclusivamente la estructura JSON proporcionada.
- No cambies nombres de claves.
- No añadas campos nuevos.
- Cada tarjeta debe tener:
  * "frente": Pregunta, término o concepto
  * "reverso": Respuesta, definición o explicación
  * "categoria": (opcional) Categoría temática
- El contenido debe ser apropiado al nivel educativo indicado.
- Para tipo "Vocabulario": frente = palabra, reverso = definición + ejemplo.
- Para tipo "Preguntas y Respuestas": frente = pregunta, reverso = respuesta completa.
- Para tipo "Definiciones": frente = término, reverso = definición clara.
- Para tipo "Conceptos": frente = concepto, reverso = explicación detallada.
- Para tipo "Fórmulas": frente = nombre de fórmula, reverso = fórmula + explicación.
- Si el estilo es "Conciso": respuestas breves y directas.
- Si el estilo es "Detallado": respuestas más completas con ejemplos.
- Si el estilo es "Visual": incluir descripciones que ayuden a visualizar.
- Todas las tarjetas deben estar numeradas correctamente (1, 2, 3, etc.).
- No escribas explicación fuera del JSON, solo JSON puro.
    `.trim();
  }

  private getSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      EXAM: 'Eres un asistente educativo experto en crear exámenes. Genera contenido en formato JSON con preguntas, opciones y respuestas correctas. Sigue estrictamente la estructura JSON proporcionada. Responde únicamente con JSON válido y nada más. No cambies nombres de claves. No añadas campos nuevos.',
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
      FLASHCARDS: 'Eres un asistente educativo experto en crear tarjetas de estudio (flashcards). Genera tarjetas educativas en formato JSON. Sigue estrictamente la estructura JSON proporcionada. Responde únicamente con JSON válido y nada más. No cambies nombres de claves. No añadas campos nuevos.',
    };

    return prompts[type] || 'Eres un asistente educativo. Genera contenido en formato JSON.';
  }
}

export default new OpenAIService();
