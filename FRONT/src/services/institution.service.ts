import api from './api';
import {
    Institution,
    CreateInstitutionRequest,
} from '../types';

export const institutionService = {
    async getAll(filters?: { isActive?: boolean; search?: string }): Promise<Institution[]> {
        const params = new URLSearchParams();
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/institutions?${params.toString()}`);
        return response.data;
    },

    async getById(id: string): Promise<Institution> {
        const response = await api.get(`/institutions/${id}`);
        return response.data;
    },

    async create(data: CreateInstitutionRequest): Promise<Institution> {
        const response = await api.post('/institutions', data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateInstitutionRequest>): Promise<Institution> {
        const response = await api.put(`/institutions/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<Institution> {
        const response = await api.delete(`/institutions/${id}`);
        return response.data;
    },

    async getStats(id: string): Promise<Institution> {
        const response = await api.get(`/institutions/${id}/stats`);
        return response.data;
    },
};
