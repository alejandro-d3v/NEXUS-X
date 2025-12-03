import axios from 'axios';
import * as mammoth from 'mammoth';

class OCRService {
    private routeLLMApiKey: string;
    private routeLLMBaseURL: string;

    constructor() {
        this.routeLLMApiKey = process.env.ROUTELLM_API_KEY || '';
        this.routeLLMBaseURL = 'https://routellm.abacus.ai/v1';
    }

    /**
     * Extract text from various file types
     */
    async extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
        try {
            switch (mimeType) {
                case 'application/pdf':
                    // PDF extraction requires RouteLLM API key
                    throw new Error('PDF extraction is not available. Please use DOCX files or paste text directly. To enable PDF support, configure ROUTELLM_API_KEY in your .env file.');

                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                case 'application/msword':
                    return await this.extractTextFromDOCX(buffer);

                case 'image/png':
                case 'image/jpeg':
                case 'image/jpg':
                    return await this.extractTextWithVision(buffer, 'image');

                default:
                    throw new Error(`Unsupported file type: ${mimeType}`);
            }
        } catch (error: any) {
            throw new Error(`${error.message}`);
        }
    }

    /**
     * Extract text from DOCX using mammoth
     */
    async extractTextFromDOCX(buffer: Buffer): Promise<string> {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return result.value.trim();
        } catch (error: any) {
            throw new Error(`DOCX extraction failed: ${error.message}`);
        }
    }

    /**
     * Extract text using RouteLLM vision model
     */
    async extractTextWithVision(buffer: Buffer, fileType: string): Promise<string> {
        try {
            // Convert buffer to base64
            const base64Data = buffer.toString('base64');

            // Determine the correct data URL format
            let dataUrl: string;
            if (fileType === 'pdf') {
                dataUrl = `data:application/pdf;base64,${base64Data}`;
            } else {
                dataUrl = `data:image/jpeg;base64,${base64Data}`;
            }

            // Call RouteLLM vision API
            const response = await axios.post(
                `${this.routeLLMBaseURL}/chat/completions`,
                {
                    model: 'gpt-4o',
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: 'Extract ALL text from this document/image. Return ONLY the extracted text, no additional commentary. Preserve the original structure.',
                                },
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: dataUrl,
                                    },
                                },
                            ],
                        },
                    ],
                    max_tokens: 4000,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.routeLLMApiKey}`,
                    },
                }
            );

            const extractedText = response.data.choices[0]?.message?.content || '';

            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('No text could be extracted from the file');
            }

            return extractedText.trim();
        } catch (error: any) {
            if (error.response) {
                throw new Error(`Vision API error: ${error.response.data?.error?.message || error.message}`);
            }
            throw new Error(`Vision extraction failed: ${error.message}`);
        }
    }

    /**
     * Validate file size and type
     */
    validateFile(file: Express.Multer.File): void {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/png',
            'image/jpeg',
            'image/jpg',
        ];

        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Unsupported file type. Allowed: PDF, DOCX, PNG, JPG');
        }
    }
}

export default new OCRService();
