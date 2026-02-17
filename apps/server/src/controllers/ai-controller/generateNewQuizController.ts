import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { AiQuizChatRole, prisma } from '@nocturn/database';
import { chain } from '../../services/init.services';
import { AgentStep } from '@nocturn/types';
import { generateNewQuizSchema } from '../../schemas/generateNewQuizSchema';

export default async function generateNewQuizController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res, 'not authorized');
            return;
        }
        const parsed_data = generateNewQuizSchema.safeParse(req.body);
        console.log('parsed data is : ', parsed_data);
        if (!parsed_data.success) {
            ResponseWriter.invalid_data(res, 'invalid data provided');
            return;
        }

        const { instruction, sessionId } = parsed_data.data;

        let session;
        if (sessionId) {
            session = await prisma.aiQuizChatSession.findUnique({
                where: {
                    id: sessionId,
                },
            });
        }

        if (!session || session?.userId !== user.id) {
            session = await prisma.aiQuizChatSession.create({
                data: {
                    userId: user.id.toString(),
                    step: AgentStep.START,
                    instruction: instruction,
                },
            });
        }
        console.log('session is : ', session);
        await prisma.aiQuizMessage.create({
            data: {
                aiQuizChatSessionId: session.id,
                role: AiQuizChatRole.USER,
                content: instruction,
            },
        });

        // the extra steps are for future
        // these can be used to handle any unwanted errors, to regenerate
        switch (session.step) {
            case AgentStep.START:
                await chain.start(res, session.id, {
                    step: session.step,
                    data: {
                        user_instruction: instruction,
                    },
                });
                break;

            case AgentStep.ASK_DIFFICULTY:
                await chain.start(res, session.id, {
                    step: session.step,
                    data: {},
                });
                break;

            case AgentStep.WAIT_DIFFICULTY:
                await chain.start(res, session.id, {
                    step: session.step,
                    data: {
                        root_instruction: session.instruction || '',
                        difficulty_instruction: instruction,
                        user_id: user.id,
                    },
                });
                break;

            case AgentStep.PLANNING:
                await chain.start(res, session.id, {
                    step: session.step,
                    data: {},
                });
                break;

            case AgentStep.GENERATE:
                await chain.start(res, session.id, {
                    step: session.step,
                    data: {},
                });
                break;

            case AgentStep.REVISE:
                await chain.start(res, session.id, {
                    step: session.step,
                    data: {
                        user_instruction: instruction,
                        quiz_id: '',
                        questions: [],
                    },
                });
                break;

            default:
                ResponseWriter.error(
                    res,
                    'INVALID_AGENT_STEP',
                    'agent felt into unknown step',
                    undefined,
                    400,
                );
                break;
        }
    } catch (error) {
        console.error('error in chat with ai controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
