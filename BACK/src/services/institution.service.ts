import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';

class InstitutionService {
    async createInstitution(data: {
        name: string;
        description?: string;
        address?: string;
        phone?: string;
        email?: string;
    }) {
        const institution = await prisma.institution.create({
            data,
        });

        return institution;
    }

    async getAllInstitutions(filters?: {
        isActive?: boolean;
        search?: string;
    }) {
        const where: any = {};

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const institutions = await prisma.institution.findMany({
            where,
            include: {
                _count: {
                    select: {
                        grades: true,
                        students: true,
                        teachers: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return institutions;
    }

    async getInstitutionById(id: string) {
        const institution = await prisma.institution.findUnique({
            where: { id },
            include: {
                grades: {
                    include: {
                        teacher: {
                            include: {
                                user: {
                                    select: {
                                        firstName: true,
                                        lastName: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                        _count: {
                            select: { students: true },
                        },
                    },
                },
                _count: {
                    select: {
                        students: true,
                        teachers: true,
                    },
                },
            },
        });

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        return institution;
    }

    async updateInstitution(id: string, data: {
        name?: string;
        description?: string;
        address?: string;
        phone?: string;
        email?: string;
        isActive?: boolean;
    }) {
        const institution = await prisma.institution.update({
            where: { id },
            data,
        });

        return institution;
    }

    async deleteInstitution(id: string) {
        // Soft delete
        const institution = await prisma.institution.update({
            where: { id },
            data: { isActive: false },
        });

        return institution;
    }

    async getInstitutionStats(id: string) {
        const institution = await prisma.institution.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        grades: true,
                        students: true,
                        teachers: true,
                        invitationCodes: true,
                    },
                },
            },
        });

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        return institution;
    }
}

export default new InstitutionService();
