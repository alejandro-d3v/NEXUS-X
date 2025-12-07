import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

class GradeService {
    async createGrade(data: {
        name: string;
        description?: string;
        institutionId: string;
        teacherId: string;
    }) {
        // Verify institution exists
        const institution = await prisma.institution.findUnique({
            where: { id: data.institutionId },
        });

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        // Verify teacher profile exists
        const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { id: data.teacherId },
        });

        if (!teacherProfile) {
            throw new NotFoundError('Teacher profile not found');
        }

        // Verify teacher belongs to this institution
        if (teacherProfile.institutionId !== data.institutionId) {
            throw new BadRequestError('Teacher does not belong to this institution');
        }

        const grade = await prisma.grade.create({
            data,
            include: {
                institution: true,
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
            },
        });

        return grade;
    }

    async getAllGrades(filters?: {
        institutionId?: string;
        teacherId?: string;
        isActive?: boolean;
        search?: string;
    }) {
        const where: any = {};

        if (filters?.institutionId) {
            where.institutionId = filters.institutionId;
        }

        if (filters?.teacherId) {
            where.teacherId = filters.teacherId;
        }

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { subject: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const grades = await prisma.grade.findMany({
            where,
            include: {
                institution: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
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
                    select: {
                        students: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return grades;
    }

    async getGradeById(id: string) {
        const grade = await prisma.grade.findUnique({
            where: { id },
            include: {
                institution: true,
                teacher: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                students: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                invitationCodes: {
                    where: { isActive: true },
                },
            },
        });

        if (!grade) {
            throw new NotFoundError('Grade not found');
        }

        return grade;
    }

    async updateGrade(id: string, data: {
        name?: string;
        description?: string;
        isActive?: boolean;
    }) {
        const grade = await prisma.grade.update({
            where: { id },
            data,
            include: {
                institution: true,
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
            },
        });

        return grade;
    }

    async deleteGrade(id: string) {
        // Check if grade has students
        const grade = await prisma.grade.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { students: true },
                },
            },
        });

        if (!grade) {
            throw new NotFoundError('Grade not found');
        }

        if (grade._count.students > 0) {
            throw new BadRequestError(
                'Cannot delete grade with enrolled students. Please reassign students first.'
            );
        }

        await prisma.grade.delete({
            where: { id },
        });

        return { message: 'Grade deleted successfully' };
    }

    async assignTeacher(gradeId: string, teacherId: string) {
        // Verify grade exists
        const grade = await prisma.grade.findUnique({
            where: { id: gradeId },
        });

        if (!grade) {
            throw new NotFoundError('Grade not found');
        }

        // Verify teacher profile exists
        const teacherProfile = await prisma.teacherProfile.findUnique({
            where: { id: teacherId },
        });

        if (!teacherProfile) {
            throw new NotFoundError('Teacher profile not found');
        }

        // Verify teacher belongs to same institution as grade
        if (teacherProfile.institutionId !== grade.institutionId) {
            throw new BadRequestError('Teacher must belong to the same institution as the grade');
        }

        const updatedGrade = await prisma.grade.update({
            where: { id: gradeId },
            data: { teacherId },
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
            },
        });

        return updatedGrade;
    }

    async getGradeStudents(gradeId: string) {
        // Query through StudentGrade many-to-many table
        const studentGrades = await prisma.studentGrade.findMany({
            where: {
                gradeId,
                isActive: true,
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                isActive: true,
                                createdAt: true,
                            },
                        },
                        institution: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });

        // Transform to match expected format (array of student profiles with user data)
        return studentGrades.map((sg: any) => ({
            ...sg.student,
            enrolledAt: sg.enrolledAt,
        }));
    }
}

export default new GradeService();
