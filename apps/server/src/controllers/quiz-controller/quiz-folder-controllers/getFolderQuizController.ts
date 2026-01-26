import { Request, Response } from 'express';
import ResponseWriter from '../../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getFolderQuizController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const folderId = req.params;
    if (!folderId) {
        ResponseWriter.not_found(res);
        return;
    }

    try {
        const folder = await prisma.quizFolder.findUnique({
            where: { id: String(folderId) },
            select: { userId: true },
        });

        if (!folder || folder.userId !== req.user.id) {
            ResponseWriter.not_found(res);
            return;
        }

        const quizzes = await prisma.quiz.findMany({
            where: {
                folderId: folderId,
                hostId: req.user.id,
                isDeleted: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                description: true,
                theme: true,
                createdAt: true,
                updatedAt: true,
                status: true,
                participantCode: true,
                spectatorCode: true,
                prizePool: true,
                currency: true,
            },
        });

        ResponseWriter.success(res, quizzes, 'Folder quizzes fetched successfully');
        return;
    } catch (error) {
        console.error('Error fetching folder quizzes:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
