import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

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
}

export default new ExportService();
