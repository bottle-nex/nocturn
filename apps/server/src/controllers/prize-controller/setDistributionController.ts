import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { allocatePrizes, isValidPrizePercentages } from '@nocturn/types';
import { z } from 'zod';

const distributionSchema = z.object({
    distributions: z
        .array(
            z.object({
                rank: z.number().int().min(1),
                percentage: z.number().min(0).max(100),
            }),
        )
        .min(1),
});

export default async function setDistributionController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { quizId } = req.params;
    const parsed = distributionSchema.safeParse(req.body);

    if (!quizId || !parsed.success) {
        ResponseWriter.invalid_data(res, 'Quiz ID and distributions array are required');
        return;
    }

    const { distributions } = parsed.data;

    // Validate: ranks must be sequential 1..N
    const sortedDistributions = [...distributions].sort((a, b) => a.rank - b.rank);
    for (let i = 0; i < sortedDistributions.length; i++) {
        if (sortedDistributions[i]!.rank !== i + 1) {
            ResponseWriter.invalid_data(res, 'Ranks must be sequential starting from 1');
            return;
        }
    }

    // Validate: percentages must sum to 100
    if (!isValidPrizePercentages(distributions.map((d) => d.percentage))) {
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

        const allocations = allocatePrizes(
            quiz.prizePool,
            sortedDistributions,
            quiz.escrowPda ? 'escrow' : 'deposit',
        );

        // Delete existing distributions and create new ones
        await prisma.$transaction([
            prisma.prizeDistribution.deleteMany({ where: { quizId } }),
            ...allocations.map((d) => {
                return prisma.prizeDistribution.create({
                    data: {
                        quizId,
                        rank: d.rank,
                        percentage: d.percentage,
                        amount: d.amount,
                        amountBaseUnits: d.amountBaseUnits,
                    },
                });
            }),
        ]);

        const created = await prisma.prizeDistribution.findMany({
            where: { quizId },
            orderBy: { rank: 'asc' },
        });

        const serializable = created.map((d) => ({
            ...d,
            amountBaseUnits: d.amountBaseUnits?.toString() ?? null,
        }));

        ResponseWriter.success(res, serializable, 'Prize distribution saved');
    } catch (error) {
        console.error('Failed to set prize distribution:', error);
        ResponseWriter.system_error(res);
    }
}
