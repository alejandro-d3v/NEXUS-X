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
    grade: string;
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
    grade?: string;
  }) {
    return await prisma.activity.findMany({
      where: {
        userId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.subject && { subject: filters.subject }),
        ...(filters?.grade && { grade: filters.grade }),
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
      },
    });
  }

  async getPublicActivities(filters?: {
    type?: ActivityType;
    subject?: string;
    grade?: string;
  }) {
    return await prisma.activity.findMany({
      where: {
        visibility: ActivityVisibility.PUBLIC,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.subject && { subject: filters.subject }),
        ...(filters?.grade && { grade: filters.grade }),
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
}

export default new ActivityService();
