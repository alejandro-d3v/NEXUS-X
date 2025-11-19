import prisma from '../config/database';
import { AIProvider } from '../types';
import { config } from '../config';

class CreditService {
  async getUserCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return user?.credits || 0;
  }

  async deductCredits(userId: string, amount: number, provider: AIProvider, description: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.credits < amount) {
      throw new Error('Insufficient credits');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } },
      }),
      prisma.creditHistory.create({
        data: {
          userId,
          amount: -amount,
          type: 'DEDUCTION',
          description,
          aiProvider: provider,
        },
      }),
    ]);
  }

  async addCredits(userId: string, amount: number, description: string) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
      }),
      prisma.creditHistory.create({
        data: {
          userId,
          amount,
          type: 'ADDITION',
          description,
        },
      }),
    ]);
  }

  getCreditCost(provider: AIProvider): number {
    const costs = {
      [AIProvider.OPENAI]: config.credits.costs.openai,
      [AIProvider.GEMINI]: config.credits.costs.gemini,
      [AIProvider.OLLAMA]: config.credits.costs.ollama,
    };

    return costs[provider] || 0;
  }

  async getCreditHistory(userId: string, limit: number = 50) {
    return await prisma.creditHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export default new CreditService();
