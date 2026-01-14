import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { redisCacheInstance } from '../../services/init-services';
import { prisma } from '@nocturn/database';
import CollabAction from '../../class/collabAction';
import { CollabRole } from '@nocturn/types';

export default async function collaboratorJoinController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res, 'user authentication failed');
            return;
        }

        const redis_cache = redisCacheInstance;
        const quiz_id = req.query.quizId as string;

        // link to collaborate
        const collaborator_token = req.query.collaboratorToken as string;

        if (!quiz_id) {
            ResponseWriter.invalid_data(res, 'quiz id not found');
            return;
        }

        if (!collaborator_token) {
            ResponseWriter.invalid_data(res, 'collaborator token not found');
            return;
        }

        const verified_token = CollabAction.verify_cookie(collaborator_token);

        if (!verified_token) {
            ResponseWriter.invalid_data(res, 'Invalid token', 401);
            return;
        }

        const { quiz, collab_session } = await prisma.$transaction(async (tx) => {
            const quiz = await tx.quiz.findUnique({
                where: {
                    id: quiz_id,
                },
            });

            const collab_session = await tx.collabSession.findUnique({
                where: {
                    id: verified_token.collabSessionId,
                    quizId: quiz_id,
                },
                include: {
                    collaborators: true,
                },
            });

            return {
                quiz,
                collab_session,
            };
        });

        // check if quiz exists
        if (!quiz) {
            ResponseWriter.not_found(res, 'invalid quiz code');
            return;
        }

        if (!['CREATED'].includes(quiz.status)) {
            ResponseWriter.error(
                res,
                'QUIZ_NOT_AVAILABLE_FOR_EDITING',
                'Quiz is not available for joining at this time.',
                undefined,
                403,
            );
            return;
        }

        // check if collab session exists
        if (!collab_session) {
            ResponseWriter.not_found(res, 'invalid collab session');
            return;
        }

        // check if the collaborator already exists
        const existing_collaborator = collab_session.collaborators.find(
            (c) => c.userId === user.id.toString(),
        );

        if(!existing_collaborator) {
            // create the collaborator
            // default role of the collaborator will be viewer
            await prisma.collaborator.create({
                data: {
                    sessionId: collab_session.id,
                    userId: user.id.toString(),
                },
            });
        }

        const collaborator_token_data = CollabAction.generate_user_token(
            user.id.toString(),
            quiz_id,
            collab_session.id,
            CollabRole.VIEWER,
        );



    } catch (error) {
        console.error('error in collaborator join controller: ', error);
        ResponseWriter.system_error(res);
    }
}
