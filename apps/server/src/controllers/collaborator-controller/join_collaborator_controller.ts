import { Request, Response } from 'express';
import { z } from 'zod';
import ResponseWriter from '../../class/response_writer';
import { CollabRole, prisma } from '@nocturn/database';

interface QuizWithCollabSession {
    id: string;
    status: string;
    CollabSession: { id: string } | null;
}

interface CollabSessionWithDetails {
    id: string;
    quizId: string;
    hostId: string;
    collaborators: { userId: string }[];
}

export default class JoinCollaboratorController {
    static async incoming_request(req: Request, res: Response) {
        const user = req.user;
        if (!user || !user.id) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const parsed_body = collaborator_join_controller_schema.safeParse(req.body);
        if (!parsed_body.success) {
            ResponseWriter.invalid_data(res, 'Valid email is required');
            return;
        }

        try {
            const quiz = await this.get_quiz_and_collab_session(req.params.id, String(user.id));
            if (!quiz) {
                ResponseWriter.not_found(res, 'Quiz not found or you are not the host');
                return;
            }

            const collab_session = await this.collab_session_processor(quiz, String(user.id));
            if (!collab_session) {
                ResponseWriter.system_error(res);
                return;
            }

            await this.target_user_processor(
                res,
                parsed_body.data.email,
                String(user.id),
                collab_session,
            );
        } catch (err) {
            console.error('Error in incoming_request:', err);
            ResponseWriter.system_error(res);
        }
    }

    static async target_user_processor(
        res: Response,
        email: string,
        host_id: string,
        collab_session: CollabSessionWithDetails,
    ) {
        try {
            const target_user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            });

            if (!target_user) {
                const existing_invitation = await prisma.collaboratorInvitation.findUnique({
                    where: {
                        sessionId_email: {
                            sessionId: collab_session.id,
                            email: email,
                        },
                    },
                });

                if (existing_invitation && existing_invitation.status === 'PENDING') {
                    ResponseWriter.success(res, null, 'Invitation already sent to this email');
                    return;
                }

                const invitation = await prisma.collaboratorInvitation.create({
                    data: {
                        sessionId: collab_session.id,
                        email: email,
                        invitedBy: host_id,
                        quizId: collab_session.quizId,
                    },
                });

                await this.send_email_invitation(email, invitation.id);
                ResponseWriter.success(res, { invitation }, `Invitation sent to ${email}`, 201);
                return;
            }

            if (target_user.id === host_id) {
                ResponseWriter.error(
                    res,
                    'INVALID_OPERATION',
                    'You cannot add yourself as a collaborator',
                    undefined,
                    400,
                );
                return;
            }

            const existing_collaborator = collab_session.collaborators.some(
                (c) => c.userId === target_user.id,
            );

            if (existing_collaborator) {
                ResponseWriter.error(
                    res,
                    'ALREADY_COLLABORATOR',
                    'User is already a collaborator on this quiz',
                    undefined,
                    409,
                );
                return;
            }

            const collaborator = await prisma.collaborator.create({
                data: {
                    sessionId: collab_session.id,
                    userId: target_user.id,
                    role: CollabRole.VIEWER,
                    joinedAt: new Date(),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            });

            await this.send_email_notification(target_user.email, collab_session.quizId);
            ResponseWriter.success(
                res,
                { collaborator },
                `${target_user.name} added as collaborator`,
                201,
            );
        } catch (err) {
            console.error('Error in target_user_processor:', err);
            ResponseWriter.system_error(res);
        }
    }

    static async collab_session_processor(
        quiz: QuizWithCollabSession,
        host_id: string,
    ): Promise<CollabSessionWithDetails | null> {
        try {
            if (quiz.CollabSession?.id) {
                return await prisma.collabSession.findUnique({
                    where: { id: quiz.CollabSession.id },
                    select: {
                        id: true,
                        quizId: true,
                        hostId: true,
                        collaborators: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                });
            }

            return await prisma.collabSession.create({
                data: {
                    quizId: quiz.id,
                    hostId: host_id,
                },
                select: {
                    id: true,
                    quizId: true,
                    hostId: true,
                    collaborators: {
                        select: {
                            userId: true,
                        },
                    },
                },
            });
        } catch (err) {
            console.error('Error in collab_session_processor:', err);
            return null;
        }
    }

    static async get_quiz_and_collab_session(
        quiz_id: string,
        host_id: string,
    ): Promise<QuizWithCollabSession | null> {
        try {
            return await prisma.quiz.findUnique({
                where: {
                    id: quiz_id,
                    hostId: host_id,
                },
                select: {
                    id: true,
                    status: true,
                    CollabSession: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
        } catch (err) {
            console.error('Error in get_quiz_and_collab_session:', err);
            return null;
        }
    }

    static async send_email_invitation(email: string, invitationId: string) {
        console.log(`Sending invitation email to ${email} for invitation ${invitationId}`);
    }

    static async send_email_notification(email: string, quizId: string) {
        console.log(`Sending notification email to ${email} for quiz ${quizId}`);
    }
}

const collaborator_join_controller_schema = z.object({
    email: z.email('Invalid email format'),
});
