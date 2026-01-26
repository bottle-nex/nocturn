import { Request, Response } from 'express';
import ResponseWriter from '../../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getQuizFoldersController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const folders = await prisma.user.findMany({
            where: {
                id: req.user.id,
            },
            include: {
                quizfolders: true,
            },
        });

        ResponseWriter.success(res, folders, 'Folders fetched successfully');
        return;
    } catch (error) {
        console.error('Error in fetchinf folders: ', error);
        return;
    }
}
