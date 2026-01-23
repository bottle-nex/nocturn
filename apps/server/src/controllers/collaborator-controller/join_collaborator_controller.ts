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

export default class Collaborator {
    /**
     * Handles the HTTP request to invite a collaborator to a quiz.
     * Validates the user, parses the request body, and orchestrates the invitation flow.
     *
     * @param req - Express request object containing user info, quiz ID in params, and email in body
     * @param res - Express response object for sending the API response
     */
    static async process(req: Request, res: Response) {
        const user = req.user;
        if (!user || !user.id) {
            ResponseWriter.not_authorized(res);
            return;
        }
        console.log('Invite Collaborator Request Body:', req.body);
        const parsed_body = inviteCollaboratorSchema.safeParse(req.body.emails);
        if (!parsed_body.success) {
            ResponseWriter.invalid_data(res, 'Valid email is required');
            return;
        }

        try {
            const quiz = await Collaborator.find_quiz_by_host_id(req.params.quizId, String(user.id));
            console.log("quiz found is : ", quiz);
            if (!quiz) {
                ResponseWriter.not_found(res, 'Quiz not found or you are not the host');
                return;
            }

            const collab_session = await Collaborator.get_or_create_collab_session(quiz, String(user.id));
            if (!collab_session) {
                ResponseWriter.system_error(res);
                return;
            }
            console.log("parsed data is : ", parsed_body.data);
            await Collaborator.invite_users_by_emails(
                res,
                parsed_body.data,
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
     * Invites multiple users to collaborate on a quiz by their email addresses.
     * Processes each email and returns results for all invitations.
     *
     * @param res - Express response object for sending the API response
     * @param emails - Array of email addresses to invite
     * @param inviter_id - ID of the quiz host who is sending the invitation
     * @param inviter_name - Name of the user sending the invitation
     * @param collab_session - The collaboration session to add the users to
     */
    static async invite_users_by_emails(
        res: Response,
        emails: string[],
        inviter_id: string,
        inviter_name: string,
        collab_session: CollabSessionWithDetails,
    ) {
        try {
            interface SuccessResult {
                email: string;
                status: string;
                message?: string;
                data?: unknown;
            }

            interface FailedResult {
                email: string;
                error: string;
            }

            const results = {
                success: [] as SuccessResult[],
                failed: [] as FailedResult[],
            };

            for (const email of emails) {
                try {
                    const result = await Collaborator.process_single_email(
                        email,
                        inviter_id,
                        inviter_name,
                        collab_session,
                    );
                    results.success.push(result);
                } catch (err) {
                    const error = err as Error;
                    results.failed.push({
                        email,
                        error: error.message || 'Failed to process invitation',
                    });
                }
            }

            const total = emails.length;
            const successCount = results.success.length;
            const failedCount = results.failed.length;

            if (failedCount === total) {
                return res.status(400).json({
                    success: false,
                    code: 'ALL_INVITATIONS_FAILED',
                    message: 'All invitations failed to process',
                    data: results,
                });
            }

            ResponseWriter.success(
                res,
                results,
                `${successCount} of ${total} invitation(s) processed successfully`,
                201,
            );
        } catch (err) {
            console.error('Error in invite_users_by_emails:', err);
            ResponseWriter.system_error(res);
        }
    }

    /**
     * Processes a single email invitation.
     * If the user exists, adds them directly as a collaborator.
     * If the user doesn't exist, creates a pending invitation.
     *
     * @param email - Email address of the user to invite
     * @param inviter_id - ID of the quiz host who is sending the invitation
     * @param inviter_name - Name of the user sending the invitation
     * @param collab_session - The collaboration session to add the user to
     * @returns Result object with status and data
     */
    static async process_single_email(
        email: string,
        inviter_id: string,
        inviter_name: string,
        collab_session: CollabSessionWithDetails,
    ) {
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
                return {
                    email,
                    status: 'already_invited',
                    message: 'Invitation already sent to this email',
                };
            }

            const invitation = await prisma.collaboratorInvitation.create({
                data: {
                    sessionId: collab_session.id,
                    email: email,
                    invitedBy: inviter_id,
                    quizId: collab_session.quizId,
                },
            });

            await Collaborator.send_collaborator_invited_notification(
                email,
                invitation.id,
                inviter_name,
                collab_session.quiz.title,
            );

            return {
                email,
                status: 'invited',
                message: `Invitation sent to ${email}`,
                data: { invitation },
            };
        }

        if (target_user.id === inviter_id) {
            throw new Error('You cannot add yourself as a collaborator');
        }

        const existing_collaborator = collab_session.collaborators.some(
            (c) => c.userId === target_user.id,
        );

        if (existing_collaborator) {
            return {
                email,
                status: 'already_collaborator',
                message: 'User is already a collaborator on this quiz',
            };
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

        await Collaborator.send_collaborator_added_notification(
            target_user.email,
            target_user.name,
            collab_session.quiz.title,
            collab_session.quizId,
            inviter_name,
        );

        return {
            email,
            status: 'added',
            message: `${target_user.name} added as collaborator`,
            data: { collaborator },
        };
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
        console.log("quiz id is : ", quiz_id, " host id is : ", host_id);
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

const inviteCollaboratorSchema = z
    .array(z.email('Invalid email format'))
    .min(1, 'At least one email is required')
    .max(5, 'Maximum 5 emails allowed')
