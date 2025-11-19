import api from './api';
import { CreditHistory } from '../types';

export const creditService = {
  async getBalance(): Promise<{ credits: number }> {
    const response = await api.get<{ credits: number }>('/credits/balance');
    return response.data;
  },

  async getHistory(): Promise<CreditHistory[]> {
    const response = await api.get<CreditHistory[]>('/credits/history');
    return response.data;
  }
};
