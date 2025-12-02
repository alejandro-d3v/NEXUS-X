import api from './api';
import { Activity, GenerateActivityRequest } from '../types';

export const activityService = {
  async generateActivity(data: GenerateActivityRequest): Promise<Activity> {
    const response = await api.post<any>('/activities/generate', data);
    console.log('API Response:', response.data);
    // El backend devuelve { activity, creditsRemaining }
    return response.data.activity || response.data;
  },

  async generateActivityWithPDF(formData: FormData): Promise<Activity> {
    const response = await api.post<Activity>('/activities/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getMyActivities(): Promise<Activity[]> {
    const response = await api.get<Activity[]>('/activities/my-activities');
    return response.data;
  },

  async getPublicActivities(): Promise<Activity[]> {
    const response = await api.get<Activity[]>('/activities/public');
    return response.data;
  },

  async getActivity(id: string): Promise<Activity> {
    const response = await api.get<Activity>(`/activities/${id}`);
    return response.data;
  },

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    const response = await api.put<Activity>(`/activities/${id}`, data);
    return response.data;
  },

  async deleteActivity(id: string): Promise<void> {
    await api.delete(`/activities/${id}`);
  }
};
