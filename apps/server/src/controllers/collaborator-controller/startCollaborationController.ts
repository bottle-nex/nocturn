import { Request, Response } from "express";
import ResponseWriter from "../../class/response_writer";
import { CollabRole, prisma } from "@nocturn/database";


export default async function startCollaborationController(req: Request, res: Response) {
    try {

        const user = req.user;
        const quiz_id = req.params.quizId;

        if(!user) {
            ResponseWriter.not_authorized(res, 'user authentication failed');
            return;
        }

        if(!quiz_id) {
            ResponseWriter.not_found(res, 'quiz id not found');
            return;
        }

        // find the quiz and the collaboration session if exists

        const result = await prisma.$transaction(async (tx) => {
            const quiz = await tx.quiz.findUnique({
                where: {
                    id: quiz_id,
                    hostId: user.id.toString(),
                },
            });

            const collab_session = await tx.collabSession.findUnique({
                where: {
                    quizId: quiz_id,
                },
            });

            return {
                quiz,
                collab_session,
            };
        });

        if(!result.quiz) {
            ResponseWriter.not_found(
                res,
                `quiz with id-${quiz_id} doesn't exist`,
            );
            return;
        }

        // check if the collab session already exists
        if(result.collab_session) {
            // conflict
            ResponseWriter.error(
                res,
                'SESSION_ALREADY_EXISTS',
                'collab session is already created for this quiz',
                undefined,
                409,
            );
            return;
        }

        // create a collaboration session and make the host a member
        const collab = await prisma.$transaction(async (tx) => {

            const session = await tx.collabSession.create({
                data: {
                    hostId: user.id.toString(),
                    quizId: quiz_id,
                },
            });
            
            const member = await tx.collaborator.create({
                data: {
                    sessionId: session.id,
                    userId: user.id.toString(),
                    role: CollabRole.HOST,
                    joinedAt: new Date(),
                }
            });

            return {
                session,
                member,
            };
        });

        // update the cache

        // set the cookie
        
        // connect to the ws server
        
    } catch (error) {
        console.error('error in start collaboration controller: ', error);
        ResponseWriter.system_error(res);
        return;  
    }
}