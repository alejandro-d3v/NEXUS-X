import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { config } from '../config';
import { UserRole } from '../types';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { randomUUID } from 'crypto';

class AdminUserService {
    async createUser(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: UserRole;
    }) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new BadRequestError('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                credits: config.credits.default,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                credits: true,
                isActive: true,
                createdAt: true,
            },
        });

        return user;
    }

    async createTeacher(
        userData: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
        },
        institutionId: string,
        profileData?: {
            subject?: string;
            title?: string;
            notes?: string;
        }
    ) {
        // Verify institution exists
        const institution = await prisma.institution.findUnique({
            where: { id: institutionId },
        });

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new BadRequestError('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user and teacher profile in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: UserRole.TEACHER,
                    credits: config.credits.default,
                },
            });

            const teacherProfile = await tx.teacherProfile.create({
                data: {
                    userId: user.id,
                    institutionId,
                    subject: profileData?.subject,
                    title: profileData?.title,
                    notes: profileData?.notes,
                },
            });

            return { user, teacherProfile };
        });

        return result;
    }

    async createStudent(
        userData: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
        },
        institutionId: string,
        gradeId: string,
        profileData?: {
            notes?: string;
        }
    ) {
        // Verify institution and grade exist
        const [institution, grade] = await Promise.all([
            prisma.institution.findUnique({ where: { id: institutionId } }),
            prisma.grade.findUnique({ where: { id: gradeId } }),
        ]);

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        if (!grade) {
            throw new NotFoundError('Grade not found');
        }

        if (grade.institutionId !== institutionId) {
            throw new BadRequestError('Grade does not belong to this institution');
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new BadRequestError('User already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user and student profile in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: UserRole.STUDENT,
                    credits: config.credits.default,
                },
            });

            // Auto-generate studentId using UUID
            const studentProfile = await tx.studentProfile.create({
                data: {
                    userId: user.id,
                    institutionId,
                    gradeId,
                    studentId: randomUUID(),
                    notes: profileData?.notes,
                },
            });

            return { user, studentProfile };
        });

        return result;
    }

    async assignTeacherToInstitution(
        userId: string,
        institutionId: string,
        profileData?: {
            subject?: string;
            title?: string;
            notes?: string;
        }
    ) {
        const [user, institution] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.institution.findUnique({ where: { id: institutionId } }),
        ]);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.role !== UserRole.TEACHER) {
            throw new BadRequestError('User must have TEACHER role');
        }

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        // Check if teacher profile already exists
        const existingProfile = await prisma.teacherProfile.findUnique({
            where: { userId },
        });

        let teacherProfile;

        if (existingProfile) {
            // Update existing profile
            teacherProfile = await prisma.teacherProfile.update({
                where: { userId },
                data: {
                    institutionId,
                    subject: profileData?.subject,
                    title: profileData?.title,
                    notes: profileData?.notes,
                },
            });
        } else {
            // Create new profile
            teacherProfile = await prisma.teacherProfile.create({
                data: {
                    userId,
                    institutionId,
                    subject: profileData?.subject,
                    title: profileData?.title,
                    notes: profileData?.notes,
                },
            });
        }

        return teacherProfile;
    }

    async assignStudentToGrade(
        userId: string,
        gradeId: string,
        institutionId: string,
        profileData?: {
            notes?: string;
        }
    ) {
        const [user, grade, institution] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.grade.findUnique({ where: { id: gradeId } }),
            prisma.institution.findUnique({ where: { id: institutionId } }),
        ]);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.role !== UserRole.STUDENT) {
            throw new BadRequestError('User must have STUDENT role');
        }

        if (!grade) {
            throw new NotFoundError('Grade not found');
        }

        if (!institution) {
            throw new NotFoundError('Institution not found');
        }

        if (grade.institutionId !== institutionId) {
            throw new BadRequestError('Grade does not belong to this institution');
        }

        // Check if student profile already exists
        const existingProfile = await prisma.studentProfile.findUnique({
            where: { userId },
        });

        let studentProfile;

        if (existingProfile) {
            // Update existing profile
            studentProfile = await prisma.studentProfile.update({
                where: { userId },
                data: {
                    gradeId,
                    institutionId,
                    notes: profileData?.notes,
                },
            });
        } else {
            // Create new profile with auto-generated studentId
            studentProfile = await prisma.studentProfile.create({
                data: {
                    userId,
                    gradeId,
                    institutionId,
                    studentId: randomUUID(),
                    notes: profileData?.notes,
                },
            });
        }

        return studentProfile;
    }

    async getAllUsersWithProfiles(filters?: {
        role?: UserRole;
        institutionId?: string;
        isActive?: boolean;
    }) {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role;
        }

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.institutionId) {
            where.OR = [
                {
                    studentProfile: {
                        institutionId: filters.institutionId,
                    },
                },
                {
                    teacherProfile: {
                        institutionId: filters.institutionId,
                    },
                },
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                credits: true,
                isActive: true,
                createdAt: true,
                studentProfile: {
                    include: {
                        institution: {
                            select: { id: true, name: true },
                        },
                        grade: {
                            select: { id: true, name: true },
                        },
                    },
                },
                teacherProfile: {
                    include: {
                        institution: {
                            select: { id: true, name: true },
                        },
                        gradesInCharge: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return users;
    }

    async getUserWithProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                credits: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                studentProfile: {
                    include: {
                        institution: true,
                        grade: {
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
                        },
                    },
                },
                teacherProfile: {
                    include: {
                        institution: true,
                        gradesInCharge: {
                            include: {
                                _count: {
                                    select: { students: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    }

    async deactivateUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });

        return updatedUser;
    }

    async activateUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isActive: true },
        });

        return updatedUser;
    }

    async updateUser(
        userId: string,
        data: {
            firstName?: string;
            lastName?: string;
            email?: string;
            password?: string;
            credits?: number;
        }
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Check if email is being changed and if it's already taken
        if (data.email && data.email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingUser) {
                throw new BadRequestError('Email already in use');
            }
        }

        // Hash password if provided
        let hashedPassword: string | undefined;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
                credits: data.credits,
            },
        });

        return updatedUser;
    }

    async updateUserRole(userId: string, newRole: UserRole) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                teacherProfile: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // If changing role, delete existing profiles
        await prisma.$transaction(async (tx) => {
            if (user.studentProfile) {
                await tx.studentProfile.delete({
                    where: { userId },
                });
            }

            if (user.teacherProfile) {
                // Check if teacher has grades assigned
                const grades = await tx.grade.findMany({
                    where: { teacherId: user.teacherProfile.id },
                });

                if (grades.length > 0) {
                    throw new BadRequestError(
                        'Cannot change role: teacher is in charge of grades. Please reassign grades first.'
                    );
                }

                await tx.teacherProfile.delete({
                    where: { userId },
                });
            }

            await tx.user.update({
                where: { id: userId },
                data: { role: newRole },
            });
        });

        return this.getUserWithProfile(userId);
    }

    async deleteUser(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teacherProfile: {
                    include: {
                        gradesInCharge: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Check if teacher has grades assigned
        if (user.teacherProfile && user.teacherProfile.gradesInCharge.length > 0) {
            throw new BadRequestError(
                'Cannot delete user: teacher is in charge of grades. Please reassign grades first.'
            );
        }

        // Hard delete - Prisma will cascade delete related profiles
        await prisma.user.delete({
            where: { id: userId },
        });
    }

    async resetDatabase(adminUserId: string, confirmationPhrase: string) {
        // Verify user is ADMIN
        const adminUser = await prisma.user.findUnique({
            where: { id: adminUserId },
        });

        if (!adminUser || adminUser.role !== UserRole.ADMIN) {
            throw new BadRequestError('Only ADMIN users can reset the database');
        }

        // Verify confirmation phrase
        if (confirmationPhrase !== 'DELETE ALL DATA') {
            throw new BadRequestError('Invalid confirmation phrase');
        }

        // Delete all data in transaction, preserving only the requesting admin
        const deletedCounts = await prisma.$transaction(async (tx) => {
            // Delete in order respecting foreign key constraints
            
            // 1. Delete ActivityGrade (junction table)
            const activityGrades = await tx.activityGrade.deleteMany({});

            // 2. Delete Activities
            const activities = await tx.activity.deleteMany({
                where: { userId: { not: adminUserId } },
            });

            // 3. Delete CreditHistory
            const creditHistory = await tx.creditHistory.deleteMany({
                where: { userId: { not: adminUserId } },
            });

            // 4. Delete InvitationCodes
            const invitationCodes = await tx.invitationCode.deleteMany({});

            // 5. Delete StudentGrade (junction table)
            const studentGrades = await tx.studentGrade.deleteMany({});

            // 6. Delete StudentProfiles
            const studentProfiles = await tx.studentProfile.deleteMany({
                where: { userId: { not: adminUserId } },
            });

            // 7. Delete Grades
            const grades = await tx.grade.deleteMany({});

            // 8. Delete TeacherProfiles
            const teacherProfiles = await tx.teacherProfile.deleteMany({
                where: { userId: { not: adminUserId } },
            });

            // 9. Delete Institutions
            const institutions = await tx.institution.deleteMany({});

            // 10. Delete all Users except the requesting ADMIN
            const users = await tx.user.deleteMany({
                where: {
                    id: { not: adminUserId },
                },
            });

            return {
                activityGrades: activityGrades.count,
                activities: activities.count,
                creditHistory: creditHistory.count,
                invitationCodes: invitationCodes.count,
                studentGrades: studentGrades.count,
                studentProfiles: studentProfiles.count,
                grades: grades.count,
                teacherProfiles: teacherProfiles.count,
                institutions: institutions.count,
                users: users.count,
            };
        });

        return deletedCounts;
    }
}

export default new AdminUserService();
