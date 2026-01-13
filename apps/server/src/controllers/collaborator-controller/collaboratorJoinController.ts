import { Request, Response } from "express";
import ResponseWriter from "../../class/response_writer";
import { redisCacheInstance } from "../../services/init-services";
import QuizAction from "../../class/quizAction";
import { prisma, QuizStatus } from "@nocturn/database";


export default async function collaboratorJoinController(req: Request, res: Response) {
    try {

        const redis_cache = redisCacheInstance;
        const quiz_id = req.query.quizId as string;
        const collaborator_token = req.query.collaboratorToken as string;

        if(!quiz_id) {
            ResponseWriter.invalid_data(res, 'quiz id not found');
            return;
        }

        if(!collaborator_token) {
            ResponseWriter.invalid_data(res, 'collaborator token not found');
            return;
        }

        const verify_token = QuizAction.verifyCookie(collaborator_token);

        if(!verify_token) {
            ResponseWriter.invalid_data(res, 'Invalid token', 401);
            return;
        }

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: quiz_id,
            },
        });

        if(!quiz) {
            ResponseWriter.not_found(res, 'invalid quiz code');
            return;
        }

        if(quiz.status !== QuizStatus.CREATED) {
            ResponseWriter.error(
                res,
                'QUIZ_NOT_AVAILABLE_FOR_EDIT',
                'Quiz is not available for joining at this time.',
                undefined,
                403,
            );
            return;
        }

        
        
    } catch (error) {
        console.error('error in collaborator join controller: ', error);
        ResponseWriter.system_error(res);
    }
}