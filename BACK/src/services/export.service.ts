import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import pdf from 'html-pdf';

class ExportService {
  async exportToWord(activity: any): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: activity.title,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Materia: ${activity.subject} | Grado: ${activity.grade}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: activity.description || '',
              spacing: { after: 400 },
            }),
            ...this.generateContentParagraphs(activity.content, activity.type),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  private generateContentParagraphs(content: any, type: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (type === 'EXAM' || type === 'QUIZ') {
      content.examen.preguntas?.forEach((q: any, index: number) => {
        console.log('Pregunta: ', q);
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${index + 1}. ${q.question ?? q.text}`,
                bold: true,
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        if (q.options) {
          q.options.forEach((opt: any, i: number) => {
            console.log('Opción: ', opt);
            paragraphs.push(
              new Paragraph({
                text: `   ${String.fromCharCode(97 + i)}) ${opt.option}`,
                spacing: { after: 50 },
              })
            );
          });
        }

        if (q.answer) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `   Respuesta: ${q.answer}`,
                  italics: true,
                }),
              ],
              spacing: { after: 200 },
            })
          );
        }
      });
    } else if (type === 'SUMMARY') {
      paragraphs.push(
        new Paragraph({
          text: content.summary || JSON.stringify(content, null, 2),
          spacing: { after: 200 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          text: JSON.stringify(content, null, 2),
          spacing: { after: 200 },
        })
      );
    }

    return paragraphs;
  }

  async exportToExcel(activity: any): Promise<Buffer> {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Actividad');

    worksheet.columns = [
      { header: 'Campo', key: 'field', width: 20 },
      { header: 'Valor', key: 'value', width: 50 },
    ];

    worksheet.addRow({ field: 'Título', value: activity.title });
    worksheet.addRow({ field: 'Materia', value: activity.subject });
    worksheet.addRow({ field: 'Grado', value: activity.grade });
    worksheet.addRow({ field: 'Descripción', value: activity.description || '' });
    worksheet.addRow({ field: '', value: '' });

    if (activity.type === 'EXAM' || activity.type === 'QUIZ') {
      worksheet.addRow({ field: 'Preguntas', value: '' });

      activity.content.questions?.forEach((q: any, index: number) => {
        worksheet.addRow({ field: `Pregunta ${index + 1}`, value: q.question });

        if (q.options) {
          q.options.forEach((opt: string, i: number) => {
            worksheet.addRow({ field: `  Opción ${String.fromCharCode(65 + i)}`, value: opt });
          });
        }

        if (q.answer) {
          worksheet.addRow({ field: '  Respuesta', value: q.answer });
        }

        worksheet.addRow({ field: '', value: '' });
      });
    } else {
      worksheet.addRow({ field: 'Contenido', value: JSON.stringify(activity.content, null, 2) });
    }

    return await workbook.xlsx.writeBuffer();
  }

  async exportToPdf(activity: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const html = this.generateExamHtml(activity);

      const options: any = {
        format: 'Letter',
        border: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      };

      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
  }

  private generateExamHtml(activity: any): string {
    const type = activity.type;

    // Handle different activity types
    if (type === 'WORD_SEARCH') {
      return this.generateWordSearchHtml(activity);
    } else if (type === 'EXAM' || type === 'QUIZ') {
      return this.generateQuizExamHtml(activity);
    } else if (type === 'SUMMARY') {
      return this.generateSummaryHtml(activity);
    } else if (type === 'EMAIL') {
      return this.generateEmailHtml(activity);
    } else if (type === 'SURVEY') {
      return this.generateSurveyHtml(activity);
    } else {
      return this.generateGenericHtml(activity);
    }
  }

  private generateWordSearchHtml(activity: any): string {
    const content = activity.content;
    const grid = content.grid || [];
    const palabras = content.palabras || [];
    const titulo = content.titulo || activity.title || 'Sopa de Letras';
    const instrucciones = content.instrucciones || 'Encuentra todas las palabras listadas en la cuadrícula.';

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1a1a2e;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1a1a2e;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .instructions {
            background: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #4CAF50;
            margin-bottom: 20px;
            border-radius: 4px;
          }
          .grid-container {
            display: flex;
            justify-content: center;
            margin: 30px 0;
          }
          table.wordsearch-grid {
            border-collapse: collapse;
            margin: 0 auto;
          }
          table.wordsearch-grid td {
            width: 30px;
            height: 30px;
            border: 1px solid #333;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            font-family: 'Courier New', monospace;
          }
          .words-list {
            margin-top: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 8px;
          }
          .words-list h3 {
            margin-top: 0;
            color: #1a1a2e;
          }
          .words-list ul {
            columns: 3;
            -webkit-columns: 3;
            -moz-columns: 3;
            list-style: none;
            padding: 0;
          }
          .words-list li {
            padding: 5px 0;
            font-weight: 500;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${titulo}</h1>
          ${activity.subject ? `<p>Materia: ${activity.subject}</p>` : ''}
        </div>

        <div class="instructions">
          <strong>Instrucciones:</strong> ${instrucciones}
        </div>

        <div class="grid-container">
          <table class="wordsearch-grid">
            <tbody>
    `;

    // Generate grid
    grid.forEach((row: string | string[]) => {
      html += '<tr>';
      const letters = typeof row === 'string' ? row.split('') : row;
      letters.forEach((letter: string) => {
        html += `<td>${letter}</td>`;
      });
      html += '</tr>';
    });

    html += `
            </tbody>
          </table>
        </div>

        <div class="words-list">
          <h3>Palabras a encontrar:</h3>
          <ul>
    `;

    palabras.forEach((palabra: string) => {
      html += `<li>• ${palabra}</li>`;
    });

    html += `
          </ul>
        </div>

        <div class="footer">
          <p>Generado por NEXUS-X | ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private generateQuizExamHtml(activity: any): string {
    const content = activity.content;
    const meta = content.meta || {};
    const preguntas = content.preguntas || [];

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1a1a2e;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #1a1a2e;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .meta-info {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
          }
          .meta-row {
            display: table-row;
          }
          .meta-label {
            display: table-cell;
            font-weight: bold;
            padding: 5px 10px;
            width: 30%;
          }
          .meta-value {
            display: table-cell;
            padding: 5px 10px;
          }
          .question {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .question-header {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 10px;
            color: #1a1a2e;
          }
          .options {
            margin-left: 20px;
            margin-top: 10px;
          }
          .option {
            margin: 8px 0;
            padding: 8px;
            background: #f9f9f9;
            border-left: 3px solid #4CAF50;
            border-radius: 4px;
          }
          .tf-question {
            margin-left: 20px;
            font-style: italic;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${activity.title || meta.titulo || 'Examen'}</h1>
          ${meta.descripcion ? `<p>${meta.descripcion}</p>` : ''}
        </div>

        <div class="meta-info">
          ${meta.materia ? `
            <div class="meta-row">
              <div class="meta-label">Materia:</div>
              <div class="meta-value">${meta.materia}</div>
            </div>
          ` : ''}
          ${meta.nivel_educativo ? `
            <div class="meta-row">
              <div class="meta-label">Nivel Educativo:</div>
              <div class="meta-value">${meta.nivel_educativo}</div>
            </div>
          ` : ''}
          ${meta.duracion_min ? `
            <div class="meta-row">
              <div class="meta-label">Duración:</div>
              <div class="meta-value">${meta.duracion_min} minutos</div>
            </div>
          ` : ''}
          ${meta.dificultad ? `
            <div class="meta-row">
              <div class="meta-label">Dificultad:</div>
              <div class="meta-value">${meta.dificultad}</div>
            </div>
          ` : ''}
        </div>

        <div class="questions">
    `;

    preguntas.forEach((pregunta: any, index: number) => {
      // Handle both exam (enunciado) and quiz (pregunta) formats
      const questionText = pregunta.pregunta || pregunta.enunciado || pregunta.question || '';
      const questionType = pregunta.tipo || pregunta.type || '';
      const options = pregunta.opciones || pregunta.options || [];
      const answer = pregunta.respuesta || '';  // For quiz format

      html += `<div class="question">`;
      html += `<div class="question-header">${index + 1}. ${questionText}</div>`;

      // Show answer if exists (quiz format)
      if (answer && !options.length) {
        html += `<div class="options" style="border-left: 3px solid #2196F3; background: #e3f2fd;">
          <strong style="color: #1976d2;">Respuesta:</strong>
          <p style="margin: 5px 0 0 0; color: #333;">${answer}</p>
        </div>`;
      }

      if ((questionType === 'opcion_multiple' || questionType === 'multiple_choice') && options.length > 0) {
        html += `<div class="options">`;
        options.forEach((opcion: any, i: number) => {
          const optionText = typeof opcion === 'string' ? opcion : (opcion.text || opcion.option || '');
          const letter = String.fromCharCode(97 + i);
          html += `<div class="option">${letter}) ${optionText}</div>`;
        });
        html += `</div>`;
      } else if (questionType === 'verdadero_falso' || questionType === 'true_false') {
        html += `<div class="tf-question">Verdadero ( ) &nbsp;&nbsp;&nbsp; Falso ( )</div>`;
      }

      html += `</div>`;
    });

    html += `
        </div>
        <div class="footer">
          <p>Generado por NEXUS-X | ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  private generateSummaryHtml(activity: any): string {
    const content = activity.content;
    let summaryText = '';
    if (content.summary) {
      summaryText = Array.isArray(content.summary) ? content.summary.join('\n\n') : content.summary;
    } else if (content.resumen) {
      summaryText = Array.isArray(content.resumen) ? content.resumen.join('\n\n') : content.resumen;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          h1 { color: #1a1a2e; border-bottom: 3px solid #1a1a2e; padding-bottom: 10px; }
          .summary-content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${activity.title}</h1>
        <div class="summary-content">
          <p>${summaryText.replace(/\n/g, '</p><p>')}</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateEmailHtml(activity: any): string {
    const content = activity.content;
    const subject = content.subject || content.asunto || activity.title;
    const greeting = content.greeting || content.saludo || '';
    const body = content.body || content.cuerpo || '';
    const closing = content.closing || content.despedida || '';
    const signature = content.signature || content.firma || '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .email-container {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            background: #fff;
          }
          .email-header {
            background: #f5f5f5;
            padding: 20px;
            border-bottom: 2px solid #1a1a2e;
          }
          .email-header strong {
            color: #1a1a2e;
            margin-right: 10px;
          }
          .email-body {
            padding: 30px;
            line-height: 1.8;
          }
          .email-greeting {
            margin-bottom: 20px;
            font-size: 1.05rem;
          }
          .email-content p {
            margin-bottom: 15px;
            color: #333;
          }
          .email-closing {
            margin-top: 30px;
            padding-top: 15px;
          }
          .email-signature {
            font-weight: bold;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <strong>Asunto:</strong> ${subject}
          </div>
          
          <div class="email-body">
            ${greeting ? `<div class="email-greeting">${greeting}</div>` : ''}
            
            <div class="email-content">
              ${body.split('\n').map((p: string) => `<p>${p}</p>`).join('')}
            </div>
            
            ${closing || signature ? `
              <div class="email-closing">
                ${closing ? `<p>${closing}</p>` : ''}
                ${signature ? `<p class="email-signature">${signature}</p>` : ''}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="footer">
          <p>Generado por NEXUS-X | ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateSurveyHtml(activity: any): string {
    return this.generateGenericHtml(activity);
  }

  private generateGenericHtml(activity: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1a1a2e; }
          pre { background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <h1>${activity.title}</h1>
        <p><strong>Tipo:</strong> ${activity.type}</p>
        <p><strong>Materia:</strong> ${activity.subject}</p>
        <h2>Contenido:</h2>
        <pre>${JSON.stringify(activity.content, null, 2)}</pre>
      </body>
      </html>
    `;
  }
}

export default new ExportService();
