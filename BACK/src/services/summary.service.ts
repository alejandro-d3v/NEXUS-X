import openaiService from './openai.service';
import { AIProvider } from '../types';

interface SummaryOptions {
    text: string;
    length?: 'short' | 'medium' | 'long';
    style?: 'bullet-points' | 'paragraph' | 'detailed';
    language?: string;
    aiProvider: AIProvider;
}

interface SummaryResult {
    summary: string;
    wordCount: number;
    keyPoints: string[];
}

class SummaryService {
    /**
     * Generate a summary from text
     */
    async generateSummary(options: SummaryOptions): Promise<SummaryResult> {
        const {
            text,
            length = 'medium',
            style = 'paragraph',
            language = 'Spanish',
            aiProvider,
        } = options;

        // Build prompt based on options
        const prompt = this.buildSummaryPrompt(text, length, style, language);

        // Generate summary using AI provider
        let summaryText: string;
        switch (aiProvider) {
            case AIProvider.OPENAI:
                const response = await openaiService.generate({
                    prompt,
                    provider: AIProvider.OPENAI,
                    type: 'SUMMARY' as any,
                    subject: 'Summary Generation',
                });
                // Extract summary from response
                summaryText = typeof response.content === 'string'
                    ? response.content
                    : response.content.summary || JSON.stringify(response.content);
                break;
            case AIProvider.GEMINI:
                // TODO: Implement Gemini service
                throw new Error('Gemini provider not yet implemented');
            case AIProvider.OLLAMA:
                // TODO: Implement Ollama service
                throw new Error('Ollama provider not yet implemented');
            default:
                throw new Error(`Unsupported AI provider: ${aiProvider}`);
        }

        // Extract key points
        const keyPoints = this.extractKeyPoints(summaryText, style);

        // Count words
        const wordCount = this.countWords(summaryText);

        return {
            summary: summaryText,
            wordCount,
            keyPoints,
        };
    }

    /**
     * Build prompt for summary generation
     */
    private buildSummaryPrompt(
        text: string,
        length: string,
        style: string,
        language: string
    ): string {
        const lengthInstructions = {
            short: '1-2 párrafos cortos',
            medium: '3-5 párrafos',
            long: 'un análisis detallado de 6 o más párrafos',
        };

        const styleInstructions = {
            'bullet-points': 'Presenta el resumen en formato de viñetas (bullet points), con puntos clave claros y concisos.',
            'paragraph': 'Presenta el resumen en formato de párrafos coherentes y bien estructurados.',
            'detailed': 'Presenta un análisis detallado con secciones, subtítulos y explicaciones profundas.',
        };

        return `Eres un asistente experto en crear resúmenes educativos de alta calidad.

Tu tarea es crear un resumen del siguiente texto en ${language}.

INSTRUCCIONES:
- Longitud: ${lengthInstructions[length as keyof typeof lengthInstructions]}
- Estilo: ${styleInstructions[style as keyof typeof styleInstructions]}
- Mantén la información más importante y relevante
- Usa un lenguaje claro y apropiado para estudiantes
- Organiza la información de manera lógica
- No inventes información que no esté en el texto original

TEXTO A RESUMIR:
${text}

RESUMEN:`;
    }

    /**
     * Extract key points from summary
     */
    private extractKeyPoints(summary: string, style: string): string[] {
        if (style === 'bullet-points') {
            // Extract bullet points
            const lines = summary.split('\n');
            return lines
                .filter(line => line.trim().match(/^[-•*]\s/))
                .map(line => line.replace(/^[-•*]\s/, '').trim())
                .filter(line => line.length > 0);
        } else {
            // Extract first sentence of each paragraph as key point
            const paragraphs = summary.split('\n\n');
            return paragraphs
                .map(para => {
                    const sentences = para.split(/[.!?]/);
                    return sentences[0]?.trim() || '';
                })
                .filter(point => point.length > 10)
                .slice(0, 5); // Max 5 key points
        }
    }

    /**
     * Count words in text
     */
    private countWords(text: string): number {
        return text.trim().split(/\s+/).length;
    }

    /**
     * Calculate credit cost based on text length
     */
    calculateCreditCost(textLength: number): number {
        // Base cost: 10 credits
        // Additional: 1 credit per 100 words
        const baseCredits = 10;
        const wordCount = textLength / 5; // Rough estimate: 5 chars per word
        const additionalCredits = Math.ceil(wordCount / 100);
        return baseCredits + additionalCredits;
    }
}

export default new SummaryService();
