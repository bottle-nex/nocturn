import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { percentageBaseUnits, validateDistributions } from '../../services/prize/prize-allocation';

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

    let sortedDistributions: DistributionEntry[];
    try {
        sortedDistributions = validateDistributions(distributions);
    } catch (error) {
        ResponseWriter.invalid_data(
            res,
            error instanceof Error ? error.message : 'Invalid distribution',
        );
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

        await prisma.$transaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM quizzes WHERE id = ${quizId} FOR UPDATE`;
            const current = await tx.quiz.findUniqueOrThrow({ where: { id: quizId } });
            if (
                current.payoutPreparedAt ||
                ['LIVE', 'PAYOUT_PENDING', 'COMPLETED', 'PAYOUT_COMPLETED'].includes(current.status)
            ) {
                throw new Error('Prize distribution is frozen after launch');
            }
            await tx.prizeDistribution.deleteMany({ where: { quizId } });
            for (const entry of sortedDistributions) {
                const pool =
                    current.fundedBaseUnits === null
                        ? BigInt(Math.round(current.prizePool * 1e6))
                        : BigInt(current.fundedBaseUnits);
                const amountBaseUnits =
                    (pool * percentageBaseUnits(entry.percentage)) / BigInt(10000);
                await tx.prizeDistribution.create({
                    data: {
                        quizId,
                        rank: entry.rank,
                        percentage: entry.percentage,
                        amount: Number(amountBaseUnits) / 1e6,
                        amountBaseUnits,
                    },
                });
            }
        });

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
