import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getRecentlyViewedController(req: Request, res: Response) {
    const user = req.user;
    if (!user || !user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const recentlyViewed = await prisma.quizViews.findMany({
            where: {
                userId: String(user.id),
                quiz: { isDeleted: false },
            },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        prizePool: true,
                        currency: true,
                        status: true,
                        scheduledAt: true,
                        createdAt: true,
                        template: true,
                        isFavourite: true,
                        host: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        questions: {
                            take: 1,
                            orderBy: {
                                orderIndex: 'asc',
                            },
                            select: {
                                question: true,
                                options: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                viewedAt: 'desc',
            },
            take: 50,
        });

        if (!recentlyViewed || recentlyViewed.length === 0) {
            ResponseWriter.success(res, [], 'No recently viewed quizzes found');
            return;
        }

        ResponseWriter.success(
            res,
            recentlyViewed,
            'Recently viewed quizzes retrieved successfully',
        );
        return;
    } catch (error) {
        console.error('Error fetching recently viewed quizzes:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
