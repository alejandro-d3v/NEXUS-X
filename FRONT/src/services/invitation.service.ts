import api from './api';
import {
    InvitationCode,
    GenerateCodeRequest,
    RegisterWithCodeRequest,
    User,
    StudentProfile,
    Grade,
    Institution,
} from '../types';

export const invitationService = {
    async generateCode(data: GenerateCodeRequest): Promise<InvitationCode> {
        const response = await api.post('/invitations/generate', data);
        return response.data;
    },

    async validateCode(code: string): Promise<{
        valid: boolean;
        message?: string;
        code?: InvitationCode;
        grade?: Grade;
        institution?: Institution;
    }> {
        const response = await api.post('/invitations/validate', { code });
        return response.data;
    },

    async useCode(data: RegisterWithCodeRequest): Promise<{
        user: User;
        studentProfile: StudentProfile;
        grade: Grade;
        institution: Institution;
    }> {
        const response = await api.post('/invitations/use', data);
        return response.data;
    },

    async getCodesByGrade(gradeId: string): Promise<InvitationCode[]> {
        const response = await api.get(`/invitations/grade/${gradeId}`);
        return response.data;
    },

    async getCodesByInstitution(institutionId: string): Promise<InvitationCode[]> {
        const response = await api.get(`/invitations/institution/${institutionId}`);
        return response.data;
    },

    async deactivateCode(codeId: string): Promise<InvitationCode> {
        const response = await api.delete(`/invitations/${codeId}`);
        return response.data;
    },

    async updateCodeSettings(
        codeId: string,
        settings: {
            description?: string;
            maxUses?: number | null;
            expiresAt?: string | null;
            isActive?: boolean;
        }
    ): Promise<InvitationCode> {
        const response = await api.put(`/invitations/${codeId}`, settings);
        return response.data;
    },

    async getMyCodes(): Promise<InvitationCode[]> {
        const response = await api.get('/invitations');
        return response.data;
    },
};
