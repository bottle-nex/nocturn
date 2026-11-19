import { prisma } from '@nocturn/database';
import { CollabSessionTokenPayload } from '@nocturn/types';

export async function hasCollaborationAccess(payload: CollabSessionTokenPayload): Promise<boolean> {
    try {
        const session = await prisma.collabSession.findFirst({
            where: {
                id: payload.collabSessionId,
                quizId: payload.quizId,
                OR: [
                    { hostId: payload.userId },
                    { collaborators: { some: { userId: payload.userId, isBlocked: false } } },
                ],
            },
            select: { id: true },
        });
        return !!session;
    } catch (error) {
        console.error('Error validating collaboration access:', error);
        return false;
    }
}
