import { Request, Response } from 'express';
import { prisma } from '@nocturn/database';
import { COLLABORATORS_MESSAGE_TYPE } from '@nocturn/types';
import ResponseWriter from '../../class/response_writer';
import { publisherInstance } from '../../services/init.services';

export default async function removeCollaboratorController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }
    const { quizId, userId } = req.params;
    try {
        const session = await prisma.collabSession.findFirst({
            where: { quizId, hostId: req.user.id },
            select: { id: true, hostId: true },
        });
        if (!session || userId === session.hostId) {
            ResponseWriter.not_authorized(res);
            return;
        }
        await prisma.collaborator.updateMany({
            where: { sessionId: session.id, userId },
            data: { isBlocked: true },
        });
        await publisherInstance.publish(
            `collab_session:${session.id}`,
            JSON.stringify({
                type: COLLABORATORS_MESSAGE_TYPE.COLLABORATOR_REMOVED,
                payload: { userId },
            }),
        );
        ResponseWriter.success(res, { userId }, 'Collaborator removed');
    } catch (error) {
        console.error('Error removing collaborator:', error);
        ResponseWriter.system_error(res);
    }
}
