import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { AiQuizChatRole, prisma } from '@nocturn/database';
import { chain } from '../../services/init.services';
import { AgentStep } from '@nocturn/types';

export default async function chatWithAiController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res, 'not authorized');
            return;
        }

        const { instruction, sessionId } = req.body;

        // add zos validation

        // try to fetch the ai-chat-session
        let session;
        session = await prisma.aiQuizChatSession.findUnique({
            where: {
                id: sessionId,
            },
        });

        if (!session) {
            session = await prisma.aiQuizChatSession.create({
                data: {
                    userId: user.id.toString(),
                    step: AgentStep.START,
                    instruction: instruction,
                },
            });
        }

        console.log({ session });

        // create the user message
        await prisma.aiQuizMessage.create({
            data: {
                aiQuizChatSessionId: session.id,
                role: AiQuizChatRole.USER,
                content: instruction,
            },
        });

        await chain.start(
            res,
            user.id.toString(),
            session.id,
            session.step as unknown as AgentStep,
            session.instruction || '',
            instruction,
        );
    } catch (error) {
        console.error('error in chat with ai controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
