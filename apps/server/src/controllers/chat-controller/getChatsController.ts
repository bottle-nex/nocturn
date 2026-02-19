import { prisma } from '@nocturn/database';
import { ChatMessageType, USER_TYPE } from '@nocturn/types';

type ReturnStatement = { success: boolean; messages?: ChatMessageType[]; error?: Error | string };

export default async function getChatsController(
    role: USER_TYPE,
    gameSessionId: string,
    quizId: string,
): Promise<ReturnStatement> {
    if (role === USER_TYPE.PARTICIPANT) {
        return { success: false, error: 'Invalid role' };
    }

    try {
        const messages = await prisma.chatMessage.findMany({
            where: { gameSessionId, quizId },
            select: {
                id: true,
                senderId: true,
                senderName: true,
                message: true,
                createdAt: true,
                senderAvatar: true,
                repliedToId: true,
                chatReactions: {
                    select: {
                        reactorName: true,
                        reactorAvatar: true,
                        reaction: true,
                        reactedAt: true,
                        reactorType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return { success: true, messages: messages.reverse() as ChatMessageType[] };
    } catch (error) {
        console.error('Unable to fetch messages', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
