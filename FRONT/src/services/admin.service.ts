import api from './api';
import {
    User,
    CreateTeacherRequest,
    CreateStudentRequest,
    TeacherProfile,
    StudentProfile,
    UserRole,
} from '../types';

export const adminService = {
    async createTeacher(data: CreateTeacherRequest): Promise<{ user: User; teacherProfile: TeacherProfile }> {
        const response = await api.post('/admin/users/teacher', data);
        return response.data;
    },

    async createStudent(data: CreateStudentRequest): Promise<{ user: User; studentProfile: StudentProfile }> {
        const response = await api.post('/admin/users/student', data);
        return response.data;
    },

    async assignTeacherToInstitution(
        userId: string,
        institutionId: string,
        profileData?: { subject?: string; title?: string; notes?: string }
    ): Promise<TeacherProfile> {
        const response = await api.post(`/admin/users/${userId}/assign-teacher`, {
            institutionId,
            ...profileData,
        });
        return response.data;
    },

    async assignStudentToGrade(
        userId: string,
        gradeId: string,
        institutionId: string,
        profileData?: { studentId?: string; notes?: string }
    ): Promise<StudentProfile> {
        const response = await api.post(`/admin/users/${userId}/assign-student`, {
            gradeId,
            institutionId,
            ...profileData,
        });
        return response.data;
    },

    async updateUserRole(userId: string, role: UserRole): Promise<User> {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    async getAllUsersWithProfiles(filters?: {
        role?: UserRole;
        institutionId?: string;
        isActive?: boolean;
    }): Promise<User[]> {
        const params = new URLSearchParams();
        if (filters?.role) params.append('role', filters.role);
        if (filters?.institutionId) params.append('institutionId', filters.institutionId);
        if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

        const response = await api.get(`/admin/users?${params.toString()}`);
        return response.data;
    },

    async getUserWithProfile(userId: string): Promise<User> {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    },

    async deactivateUser(userId: string): Promise<User> {
        const response = await api.patch(`/admin/users/${userId}/deactivate`);
        return response.data;
    },

    async activateUser(userId: string): Promise<User> {
        const response = await api.patch(`/admin/users/${userId}/activate`);
        return response.data;
    },

    async updateUser(
        userId: string,
        data: {
            firstName?: string;
            lastName?: string;
            email?: string;
            password?: string;
            credits?: number;
        }
    ): Promise<User> {
        const response = await api.patch(`/admin/users/${userId}`, data);
        return response.data;
    },
};
