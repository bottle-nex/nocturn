import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { AiQuizChatRole, prisma } from '@nocturn/database';
import { AgentStep, STREAM } from '@nocturn/types';
import { generateNewQuizSchema } from '../../schemas/generateNewQuizSchema';
import { quizAgentGraph } from '../../services/init.services';
import { stream } from '@nocturn/types';
import Agent from '../../gen/agents/Agent';

export default async function generateNewQuizController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res, 'not authorized');
            return;
        }

        const parsed_data = generateNewQuizSchema.safeParse(req.body);
        if (!parsed_data.success) {
            ResponseWriter.invalid_data(res, 'invalid data provided');
            return;
        }

        const { instruction, sessionId } = parsed_data.data;

        let session;
        if (sessionId) {
            session = await prisma.aiQuizChatSession.findUnique({
                where: { id: sessionId },
            });
        }

        if (!session || session.userId !== user.id) {
            session = await prisma.aiQuizChatSession.create({
                data: {
                    userId: user.id.toString(),
                    step: AgentStep.START,
                    instruction: instruction,
                },
            });
        }

        // save user message
        await prisma.aiQuizMessage.create({
            data: {
                aiQuizChatSessionId: session.id,
                role: AiQuizChatRole.USER,
                content: instruction,
            },
        });

        // get chat history
        const messages = await prisma.aiQuizMessage.findMany({
            where: { aiQuizChatSessionId: session.id },
            orderBy: { createdAt: 'asc' },
            select: { role: true, content: true },
        });

        const conversationHistory = messages.map((m) => `${m.role}: ${m.content}`).join('\n');

        Agent.create_stream(res);

        // Send session ID first
        ResponseWriter.stream.write(res, {
            type: STREAM.ID,
            data: session.id,
        });

        const streamResponse = await quizAgentGraph.stream(
            {
                sessionId: session.id,
                userId: user.id,
                instruction,
                conversationHistory,
                currentStep: session.step,
                existingQuizId: session.quizId || undefined,
                originalTopic: session.instruction || undefined,
                sseMessages: [],
            },
            { streamMode: 'updates' },
        );

        // LangGraph's 'updates' mode yields the exact partial state returned by each node.
        for await (const chunk of streamResponse) {
            for (const nodeName in chunk) {
                const nodeUpdate = chunk[nodeName];
                if (nodeUpdate.sseMessages && Array.isArray(nodeUpdate.sseMessages)) {
                    for (const msg of nodeUpdate.sseMessages) {
                        ResponseWriter.stream.write(res, msg as stream);
                    }
                }
            }
        }

        ResponseWriter.stream.end(res);
    } catch (error) {
        console.error('error in generate new quiz controller: ', error);

        // If headers were already sent (SSE mode), just end the stream
        if (res.headersSent) {
            ResponseWriter.stream.end(res);
        } else {
            ResponseWriter.system_error(res);
        }
    }
}
