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
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};
