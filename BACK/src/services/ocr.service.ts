import pdf from 'pdf-parse';
import fs from 'fs';
import logger from '../config/logger';

class OCRService {
  /**
   * Extrae texto de un archivo PDF
   * @param filePath Ruta del archivo PDF
   * @returns Texto extraído del PDF
   */
  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      logger.info(`Starting PDF text extraction from: ${filePath}`);
      
      // Leer el archivo PDF
      const dataBuffer = fs.readFileSync(filePath);
      
      // Extraer texto usando pdf-parse
      const data = await pdf(dataBuffer);
      
      // Limpiar y formatear el texto
      const cleanedText = this.cleanText(data.text);
      
      logger.info(`PDF text extraction successful. Characters extracted: ${cleanedText.length}`);
      
      if (cleanedText.length === 0) {
        throw new Error('El PDF no contiene texto extraíble. Asegúrate de que no sea un PDF escaneado.');
      }
      
      return cleanedText;
    } catch (error) {
      logger.error('Error extracting text from PDF:', error);
      throw new Error(`Error al procesar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Limpia y formatea el texto extraído
   * @param text Texto crudo del PDF
   * @returns Texto limpio y formateado
   */
  private cleanText(text: string): string {
    return text
      // Eliminar múltiples espacios en blanco
      .replace(/\s+/g, ' ')
      // Eliminar espacios al inicio y final
      .trim()
      // Normalizar saltos de línea
      .replace(/\n\s*\n/g, '\n\n');
  }

  /**
   * Obtiene información básica del PDF sin extraer todo el texto
   * @param filePath Ruta del archivo PDF
   * @returns Información del PDF (número de páginas, etc.)
   */
  async getPDFInfo(filePath: string): Promise<{ pages: number; info: any }> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      return {
        pages: data.numpages,
        info: data.info,
      };
    } catch (error) {
      logger.error('Error getting PDF info:', error);
      throw new Error('Error al obtener información del PDF');
    }
  }
}

export default new OCRService();
