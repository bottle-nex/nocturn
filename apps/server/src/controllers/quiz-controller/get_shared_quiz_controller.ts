import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getSharedQuizController(req: Request, res: Response) {
    const user = req.user;
    if (!user || !user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const sharedQuizzes = await prisma.quiz.findMany({
            where: {
                CollabSession: {
                    collaborators: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
                isDeleted: false,
            },
            select: {
                id: true,
                title: true,
                description: true,
                prizePool: true,
                currency: true,
                status: true,
                scheduledAt: true,
                createdAt: true,
                theme: true,
                isFavourite: true,
                host: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                CollabSession: {
                    select: {
                        collaborators: {
                            where: {
                                userId: user.id,
                            },
                            select: {
                                role: true,
                                joinedAt: true,
                            },
                        },
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
        });

        if (!sharedQuizzes || sharedQuizzes.length === 0) {
            ResponseWriter.success(res, [], 'No shared quizzes found');
            return;
        }

        ResponseWriter.success(res, sharedQuizzes, 'Shared quizzes retrieved successfully');
        return;
    } catch (error) {
        console.error('Error fetching shared quizzes:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
