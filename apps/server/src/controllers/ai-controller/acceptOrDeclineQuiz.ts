import { Request, Response } from "express";
import ResponseWriter from "../../class/response_writer";
import { AgentStep , prisma } from "@nocturn/database";


export default async function acceptOrDeclineQuiz(req: Request, res: Response) {
    try {

        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const { sessionId: session_id, decline } = req.body;
        if (!session_id || typeof session_id !== 'string') {
            ResponseWriter.invalid_data(res, 'no session provided');
            return;
        }

	if(!decline || typeof decline !== 'boolean') {
	    ResponseWriter.invalid_data(res, 'no command for declination found');
	    return;
	}

        await prisma.aiQuizChatSession.update({
            where: {
                id: session_id,
                userId: user.id,
            },
            data: {
                step: decline ? AgentStep.CANCELLED : AgentStep.ACCEPTED,
            },
        });

        ResponseWriter.success(res, {}, 'session completed');
        return;

    } catch (error) {
        console.error('error in setting quiz generation done: ', error);
        ResponseWriter.system_error(res);
    }
}
