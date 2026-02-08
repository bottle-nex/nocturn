import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getTiersController(req: Request, res: Response) {
    try {
        const tiers = await prisma.subscriptionTier.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
            select: {
                id: true,
                name: true,
                displayName: true,
                description: true,
                priceMonthly: true,
                priceYearly: true,
                currency: true,
                maxQuizzesPerMonth: true,
                maxAiGenerationsPerMonth: true,
                maxCollaborators: true,
                maxActiveQuizzes: true,
                advancedTemplates: true,
                customBranding: true,
                prioritySupport: true,
                advancedAnalytics: true,
                sortOrder: true,
            },
        });

        ResponseWriter.success(res, tiers, 'Tiers fetched successfully', 200);
    } catch (err) {
        console.error('Failed to fetch tiers:', err);
        ResponseWriter.system_error(res);
    }
}
