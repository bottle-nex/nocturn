import type { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function completeTutorialController(req: Request, res: Response) {
    if (!req.user || !req.user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        await prisma.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                isTutorialCompleted: true,
            },
        });

        ResponseWriter.success(res, null, 'Tutorial completed successfully!');
    } catch (error) {
        console.error('Failed to complete the tutorial:', error);
        ResponseWriter.system_error(res);
    }
}
