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
          ${meta.cantidad_preguntas ? `
            <div class="meta-row">
              <div class="meta-label">Total de Preguntas:</div>
              <div class="meta-value">${meta.cantidad_preguntas}</div>
            </div>
          ` : ''}
        </div>

        <div class="questions">
    `;

    preguntas.forEach((pregunta: any, index: number) => {
      html += `<div class="question">`;
      html += `<div class="question-header">${index + 1}. ${pregunta.enunciado}</div>`;

      if (pregunta.tipo === 'opcion_multiple' && pregunta.opciones) {
        html += `<div class="options">`;
        pregunta.opciones.forEach((opcion: string, i: number) => {
          const letter = String.fromCharCode(97 + i); // a, b, c, d
          html += `<div class="option">${letter}) ${opcion}</div>`;
        });
        html += `</div>`;
      } else if (pregunta.tipo === 'verdadero_falso') {
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
}

export default new ExportService();
