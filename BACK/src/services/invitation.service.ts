import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { customAlphabet } from 'nanoid';

// Generate readable invitation codes (uppercase letters and numbers, no ambiguous chars)
const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

class InvitationService {
    async generateCode(
        gradeId: string,
        createdBy: string,
        options?: {
            description?: string;
            maxUses?: number;
            expiresAt?: Date;
        }
    ) {
        // Verify grade exists
        const grade = await prisma.grade.findUnique({
            where: { id: gradeId },
            include: { institution: true },
        });

        if (!grade) {
            throw new NotFoundError('Grade not found');
        }

        // Verify user exists and has permission
        const user = await prisma.user.findUnique({
            where: { id: createdBy },
            include: { teacherProfile: true },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Generate unique code
        let code: string;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            code = nanoid();
            const existing = await prisma.invitationCode.findUnique({
                where: { code },
            });
            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new Error('Failed to generate unique code. Please try again.');
        }

        const invitationCode = await prisma.invitationCode.create({
            data: {
                code: code!,
                gradeId,
                institutionId: grade.institutionId,
                createdBy,
                description: options?.description,
                maxUses: options?.maxUses,
                expiresAt: options?.expiresAt,
            },
            include: {
                grade: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                institution: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return invitationCode;
    }

    async validateCode(code: string) {
        const invitationCode = await prisma.invitationCode.findUnique({
            where: { code },
            include: {
                grade: {
                    include: {
                        institution: true,
                    },
                },
            },
        });

        if (!invitationCode) {
            return { valid: false, message: 'Invalid invitation code' };
        }

        if (!invitationCode.isActive) {
            return { valid: false, message: 'This invitation code has been deactivated' };
        }

        if (invitationCode.expiresAt && new Date() > invitationCode.expiresAt) {
            return { valid: false, message: 'This invitation code has expired' };
        }

        if (
            invitationCode.maxUses !== null &&
            invitationCode.usedCount >= invitationCode.maxUses
        ) {
            return { valid: false, message: 'This invitation code has reached its usage limit' };
        }

        return {
            valid: true,
            code: invitationCode,
            grade: invitationCode.grade,
            institution: invitationCode.grade.institution,
        };
    }

    async useCode(
        code: string,
        userData: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
        },
        profileData?: {
            studentId?: string;
            notes?: string;
        }
    ) {
        // Validate code
        const validation = await this.validateCode(code);

        if (!validation.valid) {
            throw new BadRequestError(validation.message!);
        }

        const { grade, institution } = validation;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new BadRequestError('User already exists');
        }

        const bcrypt = require('bcryptjs');
        const { config } = require('../config');
        const { UserRole } = require('../types');

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user, student profile, and increment code usage in a transaction
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

            const studentProfile = await tx.studentProfile.create({
                data: {
                    userId: user.id,
                    institutionId: institution!.id,
                    gradeId: grade!.id,
                    studentId: profileData?.studentId,
                    notes: profileData?.notes,
                },
            });

            await tx.invitationCode.update({
                where: { code },
                data: { usedCount: { increment: 1 } },
            });

            return { user, studentProfile, grade, institution };
        });

        const { password: _, ...userWithoutPassword } = result.user;

        return {
            user: userWithoutPassword,
            studentProfile: result.studentProfile,
            grade: result.grade,
            institution: result.institution,
        };
    }

    async getCodesByGrade(gradeId: string) {
        const codes = await prisma.invitationCode.findMany({
            where: { gradeId },
            include: {
                grade: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return codes;
    }

    async getCodesByInstitution(institutionId: string) {
        const codes = await prisma.invitationCode.findMany({
            where: { institutionId },
            include: {
                grade: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return codes;
    }

    async deactivateCode(codeId: string) {
        const code = await prisma.invitationCode.update({
            where: { id: codeId },
            data: { isActive: false },
        });

        return code;
    }

    async updateCodeSettings(
        codeId: string,
        settings: {
            description?: string;
            maxUses?: number | null;
            expiresAt?: Date | null;
            isActive?: boolean;
        }
    ) {
        const code = await prisma.invitationCode.update({
            where: { id: codeId },
            data: settings,
        });

        return code;
    }

    // Public method for joining via invitation link
    async joinWithCode(
        code: string,
        userId?: string,
        userData?: {
            firstName?: string;
            lastName?: string;
            email?: string;
            password?: string;
        }
    ) {
        // Validate code first
        const validation = await this.validateCode(code);

        if (!validation.valid) {
            throw new BadRequestError(validation.message!);
        }

        const { grade, institution } = validation;
        const bcrypt = require('bcryptjs');
        const jwt = require('jsonwebtoken');
        const { config } = require('../config');
        const { UserRole } = require('../types');

        // Case 1: User is authenticated (already registered)
        if (userId) {
            // Check if user exists and is a student
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { studentProfile: true },
            });

            if (!user) {
                throw new NotFoundError('User not found');
            }

            if (user.role !== UserRole.STUDENT) {
                throw new BadRequestError('Only students can join courses');
            }

            // Ensure student profile exists - create if it doesn't
            let studentProfile = user.studentProfile;
            
            if (!studentProfile) {
                studentProfile = await prisma.studentProfile.create({
                    data: {
                        userId: user.id,
                        institutionId: institution!.id,
                        studentId: `STU-${Date.now()}`,
                    },
                });
            }

            // Check if already enrolled in this grade via StudentGrade
            const existingEnrollment = await prisma.studentGrade.findUnique({
                where: {
                    studentId_gradeId: {
                        studentId: studentProfile.id,
                        gradeId: grade!.id,
                    },
                },
            });

            if (existingEnrollment) {
                throw new BadRequestError('You are already enrolled in this grade');
            }

            // Create StudentGrade enrollment (allows multiple courses)
            await prisma.studentGrade.create({
                data: {
                    studentId: studentProfile.id,
                    gradeId: grade!.id,
                    isActive: true,
                },
            });

            // Increment code usage
            await prisma.invitationCode.update({
                where: { code },
                data: { usedCount: { increment: 1 } },
            });

            // Get final student profile with all grades
            const finalProfile = await prisma.studentProfile.findUnique({
                where: { userId: user.id },
                include: {
                    grades: {
                        include: {
                            grade: {
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
                            },
                        },
                    },
                    institution: true,
                },
            });

            const { password: _, ...userWithoutPassword } = user;

            return {
                success: true,
                message: `Successfully enrolled in ${grade!.name}`,
                user: userWithoutPassword,
                studentProfile: finalProfile,
                grade: grade,
                institution: institution,
            };
        }

        // Case 2: User is NOT authenticated (new registration)
        if (!userData || !userData.email || !userData.password || !userData.firstName || !userData.lastName) {
            throw new BadRequestError('First name, last name, email, and password are required');
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        if (existingUser) {
            throw new BadRequestError('An account with this email already exists. Please login instead.');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user and student profile in transaction
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: userData.email!,
                    password: hashedPassword,
                    firstName: userData.firstName!,
                    lastName: userData.lastName!,
                    role: UserRole.STUDENT,
                    credits: config.credits.default,
                },
            });

            // Create student profile
            const studentProfile = await tx.studentProfile.create({
                data: {
                    userId: newUser.id,
                    institutionId: institution!.id,
                    studentId: `STU-${Date.now()}`, // Auto-generate student ID
                },
            });

            // Create StudentGrade enrollment
            await tx.studentGrade.create({
                data: {
                    studentId: studentProfile.id,
                    gradeId: grade!.id,
                    isActive: true,
                },
            });

            // Get student profile with grades
            const studentProfileWithGrades = await tx.studentProfile.findUnique({
                where: { id: studentProfile.id },
                include: {
                    grades: {
                        include: {
                            grade: {
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
                            },
                        },
                    },
                    institution: true,
                },
            });

            await tx.invitationCode.update({
                where: { code },
                data: { usedCount: { increment: 1 } },
            });

            return { user: newUser, studentProfile: studentProfileWithGrades };
        });

        // Generate JWT token for auto-login
        const token = jwt.sign(
            { userId: result.user.id, role: result.user.role },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        const { password: _, ...userWithoutPassword } = result.user;

        return {
            success: true,
            message: `Account created successfully! Welcome to ${grade!.name}!`,
            user: userWithoutPassword,
            studentProfile: result.studentProfile,
            grade: grade,
            institution: institution,
            token, // Return token for auto-login
        };
    }
}

export default new InvitationService();
