import type { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getTutorialStatusController(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id,
            },
            select: {
                isTutorialCompleted: true,
            },
        });

        ResponseWriter.success(
            res,
            user?.isTutorialCompleted,
            'Fetched tutorial status successfully',
        );
        return;
    } catch (error) {
        console.error('failed to fetch tutorial status, ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
