import api from './api';
import {
    Grade,
    CreateGradeRequest,
    StudentProfile,
} from '../types';

export const gradeService = {
    async getAll(filters?: {
        institutionId?: string;
        teacherId?: string;
        isActive?: boolean;
        search?: string;
    }): Promise<Grade[]> {
        const params = new URLSearchParams();
        if (filters?.institutionId) params.append('institutionId', filters.institutionId);
        if (filters?.teacherId) params.append('teacherId', filters.teacherId);
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters?.search) params.append('search', filters.search);

        const response = await api.get(`/grades?${params.toString()}`);
        return response.data;
    },

    async getMyGrades(): Promise<Grade[]> {
        const response = await api.get('/grades/my-grades');
        return response.data;
    },

    async getById(id: string): Promise<Grade> {
        const response = await api.get(`/grades/${id}`);
        return response.data;
    },

    async create(data: CreateGradeRequest): Promise<Grade> {
        const response = await api.post('/grades', data);
        return response.data;
    },

    async update(id: string, data: Partial<CreateGradeRequest>): Promise<Grade> {
        const response = await api.put(`/grades/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<{ message: string }> {
        const response = await api.delete(`/grades/${id}`);
        return response.data;
    },

    async assignTeacher(gradeId: string, teacherId: string): Promise<Grade> {
        const response = await api.post(`/grades/${gradeId}/assign-teacher`, { teacherId });
        return response.data;
    },

    async getStudents(gradeId: string): Promise<StudentProfile[]> {
        const response = await api.get(`/grades/${gradeId}/students`);
        return response.data;
    },
};
