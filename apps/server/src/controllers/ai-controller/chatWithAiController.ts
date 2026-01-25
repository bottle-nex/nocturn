import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { AgentStep, AiQuizChatRole, prisma } from '@nocturn/database';
import Agent from '../../gen/agents/Agent';

export default async function chatWithAiController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res, 'not authorized');
            return;
        }

        const { instruction, session_id } = req.body;

        // try to fetch the ai-chat-session
        let session;
        session = await prisma.aiQuizChatSession.findUnique({
            where: {
                id: session_id,
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

        // create the user message
        await prisma.aiQuizMessage.create({
            data: {
                aiQuizChatSessionId: session.id,
                role: AiQuizChatRole.USER,
                content: instruction,
            },
        });

        const agent = Agent.create_graph();

        // continue the agent
        switch (session.step) {
            case AgentStep.START: {
                // ask for difficulty
                await agent.invoke({
                    res: res,
                    sessionId: session_id,
                    userId: user.id.toString(),
                    instruction: instruction,
                    step: AgentStep.ASK_DIFFICULTY,
                });
                return;
            }
            case AgentStep.WAIT_DIFFICULTY: {
                await agent.invoke({
                    res: res,
                    sessionId: session_id,
                    userId: user.id.toString(),
                    instruction: instruction,
                });
            }
        }
    } catch (error) {
        console.error('error in chat with ai controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
