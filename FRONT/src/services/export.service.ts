import api from './api';

export const exportService = {
  async exportToWord(activityId: string): Promise<Blob> {
    const response = await api.get(`/export/${activityId}/word`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async exportToExcel(activityId: string): Promise<Blob> {
    const response = await api.get(`/export/${activityId}/excel`, {
      responseType: 'blob'
    });
    return response.data;
  },

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  exportToPDF(htmlContent: string, title: string) {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permite las ventanas emergentes para exportar a PDF');
      return;
    }

    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1, h2, h3 { color: #333; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      printWindow.print();
    };
  },
};
