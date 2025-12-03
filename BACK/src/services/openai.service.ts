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
      } else if (request.type === 'ESSAY' && request.additionalParams) {
        userPrompt = this.buildEssayPrompt(request);
      } else if (request.type === 'GAME' && request.additionalParams) {
        userPrompt = this.buildGamePrompt(request);
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

  private buildEssayPrompt(request: AIGenerationRequest): string {
    const essayTemplate = require('../templates/essay.json');
    const params = (request.additionalParams || {}) as any;

    return `
Genera un ensayo académico en formato JSON utilizando la siguiente estructura fija:

${JSON.stringify(essayTemplate, null, 2)}

Rellena todos los campos con contenido original, coherente y bien estructurado.

### Contexto:
${request.prompt}

### Parámetros del ensayo:

Título: ${params.titulo || request.subject || 'Sin título'}
Descripción/Tema: ${params.descripcion || params.tema || ''}
Nivel educativo: ${params.nivelEducativo || request.grade}
Número de páginas aproximado: ${params.numeroPaginas || 3}
Tipo de ensayo: ${params.tipoEnsayo || 'Argumentativo'}
Estilo de escritura: ${params.estilo || 'Académico'}
Formato de citas: ${params.formatoCitas || 'APA'}

### Reglas:

- Usa exclusivamente la estructura JSON proporcionada.
- No cambies nombres de claves.
- No añadas campos nuevos.
- El ensayo debe tener:
  * "meta": Información del ensayo (título, autor, fecha, etc.)
  * "resumen": Un resumen breve del contenido (abstract)
  * "introduccion": Introducción que presente el tema y la tesis
  * "desarrollo": Array de secciones con título y contenido
  * "conclusion": Conclusión que cierre el argumento
  * "referencias": Array de referencias bibliográficas
- El contenido debe ser apropiado al nivel educativo indicado.
- Para tipo "Argumentativo": presenta una tesis clara y argumentos sólidos.
- Para tipo "Expositivo": explica el tema de manera clara y objetiva.
- Para tipo "Narrativo": cuenta una historia con estructura clara.
- Para tipo "Descriptivo": describe detalladamente el tema.
- Para tipo "Analítico": analiza y descompone el tema en partes.
- Para tipo "Comparativo": compara y contrasta diferentes aspectos.
- Si el estilo es "Académico": usa lenguaje formal y técnico.
- Si el estilo es "Formal": mantén formalidad pero más accesible.
- Si el estilo es "Científico": enfócate en datos y evidencia.
- Las referencias deben seguir el formato ${params.formatoCitas || 'APA'}.
- El desarrollo debe tener entre 2-5 secciones dependiendo de la extensión.
- Cada sección del desarrollo debe tener un título descriptivo.
- No escribas explicación fuera del JSON, solo JSON puro.
    `.trim();
  }

  private buildGamePrompt(request: AIGenerationRequest): string {
    const gameTemplate = require('../templates/game.json');
    const params = (request.additionalParams || {}) as any;
    const tipoJuego = params.tipoJuego || 'Sopa de Letras';
    const isCrossword = tipoJuego.toLowerCase().includes('crucigrama');

    if (isCrossword) {
      return `
Genera un crucigrama educativo en formato JSON utilizando la siguiente estructura:

${JSON.stringify(gameTemplate, null, 2)}

### Contexto:
${request.prompt}

### Parámetros:

Título/Tema: ${params.titulo || request.subject}
Número de palabras: ${params.numeroPalabras || 10}
Nivel educativo: ${params.nivelEducativo || request.grade}
Palabras específicas: ${params.descripcion || 'Generar automáticamente'}

### Reglas para generar el crucigrama:

- El campo "tipo" debe ser "crucigrama"
- "grid" debe ser una matriz 2D donde:
  * Cada celda es un objeto con: {letter: "A", blocked: false, number: 1}
  * "blocked: true" para celdas negras
  * "number" solo en celdas de inicio de palabra
  * El tamaño ideal es 15x15
- "palabras" debe ser un array con las palabras del crucigrama
- "pistas" debe tener dos arrays:
  * "horizontal": [{numero: 1, pista: "...", respuesta: "..."}]
  * "vertical": [{numero: 2, pista: "...", respuesta: "..."}]
- Las palabras deben entrecruzarse de manera inteligente
- Las pistas deben ser educativas y apropiadas al nivel
- Si se proporcionaron palabras específicas, úsalas; sino, genera palabras relacionadas al tema
- Asegúrate de que las palabras estén correctamente colocadas en el grid
- Los números en el grid deben corresponder a los números de las pistas
- No añadas campos nuevos al JSON
      `.trim();
    } else {
      return `
Genera una sopa de letras educativa en formato JSON utilizando la siguiente estructura:

${JSON.stringify(gameTemplate, null, 2)}

### Contexto:
${request.prompt}

### Parámetros:

Título/Tema: ${params.titulo || request.subject}
Número de palabras: ${params.numeroPalabras || 10}
Nivel educativo: ${params.nivelEducativo || request.grade}
Palabras específicas: ${params.descripcion || 'Generar automáticamente'}

### Reglas para generar la sopa de letras:

- El campo "tipo" debe ser "sopa_letras"
- "grid" debe ser una matriz 2D de letras (strings):
  * Ejemplo: [["A","B","C"],["D","E","F"]]
  * Tamaño ideal: 15x15 para más de 10 palabras, 12x12 para menos
  * Las palabras pueden estar en horizontal, vertical o diagonal
  * Rellena espacios vacíos con letras aleatorias
- "palabras" debe ser un array con las palabras a buscar en mayúsculas
- "pistas" puede estar vacío para sopa de letras
- Si se proporcionaron palabras específicas en la descripción, úsalas
- Si no, genera palabras relacionadas al tema/título
- Las palabras deben estar realmente colocadas en el grid
- Asegúrate de que todas las palabras del array "palabras" existan en el grid
- No añadas campos nuevos al JSON
- Responde únicamente con JSON válido
      `.trim();
    }
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
      ESSAY: 'Eres un asistente educativo experto en redacción académica y ensayos. Genera ensayos bien estructurados y coherentes en formato JSON. Sigue estrictamente la estructura JSON proporcionada. Responde únicamente con JSON válido y nada más. No cambies nombres de claves. No añadas campos nuevos.',
      GAME: 'Eres un asistente educativo experto en crear juegos educativos como sopas de letras y crucigramas. Genera juegos en formato JSON siguiendo estrictamente la estructura proporcionada. Las palabras deben estar correctamente colocadas en el grid. Responde únicamente con JSON válido.',
    };

    return prompts[type] || 'Eres un asistente educativo. Genera contenido en formato JSON.';
  }
}

export default new OpenAIService();
