import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getLearningJourneyController(req: Request, res: Response) {
    const user = req.user;
    if (!user || !user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const data = await prisma.user.findUnique({
            where: { id: user.id },
            select: { learningJourneyStep: true },
        });

        if (!data) {
            ResponseWriter.not_found(res);
            return;
        }

        ResponseWriter.success(res, data, 'Fetched learning journey successfully');
    } catch (err) {
        console.error('Error fetching learning journey:', err);
        ResponseWriter.system_error(res);
    }
}
