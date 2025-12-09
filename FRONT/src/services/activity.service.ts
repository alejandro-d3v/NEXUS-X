import api from './api';
import { Activity, GenerateActivityRequest } from '../types';

export const activityService = {
  async generateActivity(data: GenerateActivityRequest): Promise<Activity> {
    const response = await api.post<Activity>('/activities/generate', data);
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

  async getPublicActivitiesForTeachers(): Promise<Activity[]> {
    const response = await api.get<Activity[]>('/activities/public-teachers');
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
  },

  async assignToGrades(activityId: string, gradeIds: string[]): Promise<any> {
    const response = await api.post(`/activities/${activityId}/assign`, { gradeIds });
    return response.data;
  }
};
