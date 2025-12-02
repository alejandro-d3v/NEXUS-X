import api from './api';
import { Grade, User } from '../types';

export const teacherService = {
    // Get teacher's assigned grades
    async getMyGrades(): Promise<Grade[]> {
        const response = await api.get('/grades/my-grades');
        return response.data;
    },

    // Get students in a specific grade
    async getGradeStudents(gradeId: string): Promise<User[]> {
        const response = await api.get(`/grades/${gradeId}/students`);
        return response.data;
    },

    // Get teacher profile with statistics
    async getMyProfile(): Promise<{
        user: User;
        stats: {
            totalGrades: number;
            totalStudents: number;
            activeInvitations: number;
        };
    }> {
        const response = await api.get('/teacher/profile');
        return response.data;
    },

    // Get all grades (for creating new ones)
    async getAllGrades(): Promise<Grade[]> {
        const response = await api.get('/grades');
        return response.data;
    },
};
