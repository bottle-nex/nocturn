import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

interface DistributionEntry {
    rank: number;
    percentage: number;
}

export default async function setDistributionController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;
    const { distributions } = req.body as { distributions: DistributionEntry[] };

    if (!quizId || !distributions || !Array.isArray(distributions) || distributions.length === 0) {
        ResponseWriter.invalid_data(res, 'Quiz ID and distributions array are required');
        return;
    }

    // Validate: ranks must be sequential 1..N
    const sortedDistributions = [...distributions].sort((a, b) => a.rank - b.rank);
    for (let i = 0; i < sortedDistributions.length; i++) {
        if (sortedDistributions[i]!.rank !== i + 1) {
            ResponseWriter.invalid_data(res, 'Ranks must be sequential starting from 1');
            return;
        }
    }

    // Validate: percentages must sum to 100
    const totalPercentage = distributions.reduce((sum, d) => sum + d.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
        ResponseWriter.invalid_data(res, 'Percentages must sum to 100');
        return;
    }

    try {
        const quiz = await prisma.quiz.findFirst({
            where: { id: quizId, hostId: req.user.id },
        });

        if (!quiz) {
            ResponseWriter.not_found(res, 'Quiz not found');
            return;
        }

        if (!quiz.prizePool || quiz.prizePool <= 0) {
            ResponseWriter.invalid_data(res, 'Quiz must have a prize pool set');
            return;
        }

        // Delete existing distributions and create new ones
        await prisma.$transaction([
            prisma.prizeDistribution.deleteMany({ where: { quizId } }),
            ...sortedDistributions.map((d) => {
                const amount = (quiz.prizePool * d.percentage) / 100;
                const amountLamports = BigInt(Math.floor(amount * 1e9));
                return prisma.prizeDistribution.create({
                    data: {
                        quizId,
                        rank: d.rank,
                        percentage: d.percentage,
                        amount,
                        amountLamports,
                    },
                });
            }),
        ]);

        const created = await prisma.prizeDistribution.findMany({
            where: { quizId },
            orderBy: { rank: 'asc' },
        });

        ResponseWriter.success(res, created, 'Prize distribution saved');
    } catch (error) {
        console.error('Failed to set prize distribution:', error);
        ResponseWriter.system_error(res);
    }
}
