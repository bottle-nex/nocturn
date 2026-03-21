import { Request, Response } from "express";
import ResponseWriter from "../../class/response_writer";
import { AgentStep, prisma } from "@nocturn/database";

export default async function getLastAIChatController(req: Request, res: Response) {
    try {
        const user = req.user;
        if(!user) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const session = await prisma.aiQuizChatSession.findFirst({
            where: {
                userId: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                messages: {
                    select: {
                        id: true,
                        role: true,
                        content: true,
                        element: true,
                        createdAt: true,
                    }
                },
                quiz: true,
                step: true,
            },
        });
        
        if(!session || session.step === AgentStep.ACCEPTED || session.step === AgentStep.CANCELLED) {
            ResponseWriter.custom(
                res,
                true,
                'NO_SESSIONS_FOUND',
                'no sessions found',
                404,
            );
            return;
        }

        const { step, ...sessionWithoutStep } = session;

        ResponseWriter.success(
            res,
            sessionWithoutStep,
            'session fetched successfully',
        );
        return;
        
    } catch (error) {
        console.error('error in getting last chat of AI: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}