import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function upsertLearningJourneyController(req: Request, res: Response) {
    const user = req.user;
    if (!user || !user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const { learningJourneyStep } = req.body;

        if (
            !learningJourneyStep ||
            !Array.isArray(learningJourneyStep) ||
            learningJourneyStep.some((step) => typeof step !== 'number')
        ) {
            ResponseWriter.invalid_data(res, 'Invalid learningJourneyStep');
            return;
        }
        if (learningJourneyStep.some((step) => step < 0 || step > 5)) {
            ResponseWriter.invalid_data(res, 'learningJourneyStep must be between 0 and 5');
            return;
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { learningJourneyStep },
        });
        ResponseWriter.success(res, 'Learning journey step updated successfully');
    } catch (err) {
        console.error(err);
        ResponseWriter.system_error(res);
    }
}
