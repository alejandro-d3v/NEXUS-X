import prisma from '../config/database';
import { ActivityType, ActivityVisibility, AIProvider } from '../types';

class ActivityService {
  async createActivity(data: {
    title: string;
    description?: string;
    type: ActivityType;
    visibility: ActivityVisibility;
    content: any;
    subject: string;
    aiProvider: AIProvider;
    creditCost: number;
    userId: string;
  }) {
    return await prisma.activity.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activityGrades: {
          include: {
            grade: {
              select: {
                id: true,
                name: true,
                subject: true,
              },
            },
          },
        },
      },
    });
  }

  async getActivityById(id: string, userId?: string) {
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        activityGrades: {
          include: {
            grade: {
              select: {
                id: true,
                name: true,
                subject: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.visibility === ActivityVisibility.PRIVATE && activity.userId !== userId) {
      throw new Error('Access denied');
    }

    return activity;
  }

  async getUserActivities(userId: string, filters?: {
    type?: ActivityType;
    subject?: string;
  }) {
    return await prisma.activity.findMany({
      where: {
        userId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.subject && { subject: filters.subject }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        activityGrades: {
          include: {
            grade: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async getPublicActivities(filters?: {
    type?: ActivityType;
    subject?: string;
  }) {
    return await prisma.activity.findMany({
      where: {
        visibility: ActivityVisibility.PUBLIC,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.subject && { subject: filters.subject }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        activityGrades: {
          include: {
            grade: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateActivity(id: string, userId: string, data: {
    title?: string;
    description?: string;
    visibility?: ActivityVisibility;
  }) {
    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.userId !== userId) {
      throw new Error('Access denied');
    }

    return await prisma.activity.update({
      where: { id },
      data,
    });
  }

  async deleteActivity(id: string, userId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.userId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.activity.delete({
      where: { id },
    });
  }

  // New methods for grade assignment
  async assignToGrades(activityId: string, gradeIds: string[], assignedBy: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    // Check permissions: owner can assign, or public activities can be assigned by any teacher
    if (activity.visibility === ActivityVisibility.PRIVATE && activity.userId !== assignedBy) {
      throw new Error('Cannot assign private activities from other teachers');
    }

    // Create ActivityGrade entries
    const assignments = await Promise.all(
      gradeIds.map(gradeId =>
        prisma.activityGrade.upsert({
          where: {
            activityId_gradeId: {
              activityId,
              gradeId,
            },
          },
          create: {
            activityId,
            gradeId,
            assignedBy,
          },
          update: {
            assignedBy,
            assignedAt: new Date(),
          },
        })
      )
    );

    return assignments;
  }

  async unassignFromGrade(activityId: string, gradeId: string, userId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    // Only owner can unassign
    if (activity.userId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.activityGrade.delete({
      where: {
        activityId_gradeId: {
          activityId,
          gradeId,
        },
      },
    });
  }

  async getActivitiesByGrade(gradeId: string) {
    const activityGrades = await prisma.activityGrade.findMany({
      where: { gradeId },
      include: {
        activity: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return activityGrades.map(ag => ({
      ...ag.activity,
      assignedAt: ag.assignedAt,
      assignedBy: ag.assignedBy,
    }));
  }

  async getStudentActivities(userId: string) {
    // Get all student's enrolled grades
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        grades: {
          where: { isActive: true },
          include: {
            grade: {
              select: {
                id: true,
                name: true,
                subject: true,
                level: true,
              },
            },
          },
        },
      },
    });

    if (!student || !student.grades || student.grades.length === 0) {
      return [];
    }

    // Get all grade IDs
    const gradeIds = student.grades.map(sg => sg.gradeId);

    // Fetch activities for all grades
    const activityGrades = await prisma.activityGrade.findMany({
      where: {
        gradeId: { in: gradeIds },
      },
      include: {
        activity: {
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
        grade: {
          select: {
            id: true,
            name: true,
            subject: true,
            level: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    // Return activities with grade information
    return activityGrades.map(ag => ({
      ...ag.activity,
      grade: ag.grade,
      assignedAt: ag.assignedAt,
    }));
  }
}

export default new ActivityService();
