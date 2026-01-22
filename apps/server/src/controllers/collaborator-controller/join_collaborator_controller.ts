import { Request, Response } from 'express';
import { z } from 'zod';
import ResponseWriter from '../../class/response_writer';
import { CollabRole, prisma } from '@nocturn/database';
import { email_service_instance } from '../../services/init.services';

interface QuizWithCollabSession {
    id: string;
    status: string;
    CollabSession: { id: string } | null;
}

interface CollabSessionWithDetails {
    id: string;
    quizId: string;
    quiz: {
        title: string;
    };
    hostId: string;
    collaborators: { userId: string }[];
}

export default class JoinCollaboratorController {
    /**
     * Handles the HTTP request to invite a collaborator to a quiz.
     * Validates the user, parses the request body, and orchestrates the invitation flow.
     *
     * @param req - Express request object containing user info, quiz ID in params, and email in body
     * @param res - Express response object for sending the API response
     */
    static async handle_invite_collaborator(req: Request, res: Response) {
        const user = req.user;
        if (!user || !user.id) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const parsed_body = inviteCollaboratorSchema.safeParse(req.body);
        if (!parsed_body.success) {
            ResponseWriter.invalid_data(res, 'Valid email is required');
            return;
        }

        try {
            const quiz = await this.find_quiz_by_host_id(req.params.id, String(user.id));
            if (!quiz) {
                ResponseWriter.not_found(res, 'Quiz not found or you are not the host');
                return;
            }

            const collab_session = await this.get_or_create_collab_session(quiz, String(user.id));
            if (!collab_session) {
                ResponseWriter.system_error(res);
                return;
            }

            await this.invite_user_by_email(
                res,
                parsed_body.data.email,
                String(user.id),
                String(user.name),
                collab_session,
            );
        } catch (err) {
            console.error('Error in handle_invite_collaborator:', err);
            ResponseWriter.system_error(res);
        }
    }

    /**
     * Invites a user to collaborate on a quiz by their email address.
     * If the user exists, adds them directly as a collaborator.
     * If the user doesn't exist, creates a pending invitation.
     *
     * @param res - Express response object for sending the API response
     * @param email - Email address of the user to invite
     * @param host_id - ID of the quiz host who is sending the invitation
     * @param collab_session - The collaboration session to add the user to
     */
    static async invite_user_by_email(
        res: Response,
        email: string,
        inviter_id: string,
        inviter_name: string,
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
                        invitedBy: inviter_id,
                        quizId: collab_session.quizId,
                    },
                });

                await this.send_collaborator_invited_notification(
                    email,
                    invitation.id,
                    inviter_name,
                    collab_session.quiz.title,
                );
                ResponseWriter.success(res, { invitation }, `Invitation sent to ${email}`, 201);
                return;
            }

            if (target_user.id === inviter_id) {
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

            await this.send_collaborator_added_notification(
                target_user.email,
                target_user.name,
                collab_session.quiz.title,
                collab_session.quizId,
                inviter_name,
            );
            ResponseWriter.success(
                res,
                { collaborator },
                `${target_user.name} added as collaborator`,
                201,
            );
        } catch (err) {
            console.error('Error in invite_user_by_email:', err);
            ResponseWriter.system_error(res);
        }
    }

    /**
     * Retrieves an existing collaboration session or creates a new one for the quiz.
     *
     * @param quiz - The quiz object containing optional existing CollabSession
     * @param host_id - ID of the user who will be the host of the collaboration session
     * @returns The collaboration session with details, or null if an error occurs
     */
    static async get_or_create_collab_session(
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
                        quiz: {
                            select: {
                                title: true,
                            },
                        },
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
                    quiz: {
                        select: {
                            title: true,
                        },
                    },
                    hostId: true,
                    collaborators: {
                        select: {
                            userId: true,
                        },
                    },
                },
            });
        } catch (err) {
            console.error('Error in get_or_create_collab_session:', err);
            return null;
        }
    }

    /**
     * Finds a quiz by its ID, ensuring the requesting user is the host.
     *
     * @param quiz_id - The unique identifier of the quiz
     * @param host_id - The ID of the user who should be the host
     * @returns The quiz with its collaboration session info, or null if not found or user is not the host
     */
    static async find_quiz_by_host_id(
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
            console.error('Error in find_quiz_by_host_id:', err);
            return null;
        }
    }

    /**
     * Sends an invitation email to a user who doesn't have an account yet.
     *
     * @param email - The recipient's email address
     * @param invitationId - The unique identifier of the invitation for tracking
     */
    static async send_collaborator_invited_notification(
        email: string,
        invitationId: string,
        inviterName: string,
        quizTitle: string,
    ) {
        console.log(`Sending invitation email to ${email} for invitation ${invitationId}`);
        await email_service_instance.email_to_invite_collaborators({
            email,
            invitationId,
            inviterName,
            quizTitle,
        });
    }

    /**
     * Sends a notification email to an existing user who was added as a collaborator.
     *
     * @param email - The recipient's email address
     * @param quizId - The ID of the quiz they were added to
     */
    static async send_collaborator_added_notification(
        email: string,
        name: string,
        quiz_title: string,
        quizId: string,
        inviter_name: string,
    ) {
        console.log(`Sending notification email to ${email} for quiz ${quizId}`);
        await email_service_instance.email_to_add_collaborators({
            email,
            name,
            quizTitle: quiz_title,
            quizId,
            inviterName: inviter_name,
        });
    }
}

const inviteCollaboratorSchema = z.object({
    email: z.email('Invalid email format'),
});
