import {
    CollaboratorAddedEmailData,
    CollaboratorInviteEmailData,
    EmailJob,
    EmailJobType,
    OtpEmailData,
    WinnerNotificationEmailData,
} from '@nocturn/types';
import Bull from 'bull';
import { env } from '../../configs/env';

export default class EmailServiceQueue {
    private email_queue: Bull.Queue;
    private readonly job_options: Bull.JobOptions = {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
    };

    constructor(queue_name: string) {
        this.email_queue = new Bull<EmailJob>(queue_name, env.SERVER_REDIS_URL, {
            defaultJobOptions: this.job_options,
        });
    }

    public async email_to_add_collaborators(
        data: CollaboratorAddedEmailData,
    ): Promise<Bull.Job<EmailJob> | undefined> {
        try {
            const job = await this.email_queue.add({
                type: EmailJobType.COLLABORATOR_ADDED,
                data,
            });
            return job;
        } catch (err) {
            console.error('Error adding email job to queue:', err);
            return undefined;
        }
    }

    public async email_to_invite_collaborators(
        data: CollaboratorInviteEmailData,
    ): Promise<Bull.Job<EmailJob> | undefined> {
        try {
            const job = await this.email_queue.add({
                type: EmailJobType.COLLABORATOR_INVITE,
                data,
            });
            return job;
        } catch (err) {
            console.error('Error adding email job to queue:', err);
            return undefined;
        }
    }

    public async email_send_otp(data: OtpEmailData): Promise<Bull.Job<EmailJob> | undefined> {
        try {
            const job = await this.email_queue.add({
                type: EmailJobType.OTP_EMAIL,
                data,
            });
            return job;
        } catch (err) {
            console.error('Error adding OTP email job to queue:', err);
            return undefined;
        }
    }

    public async email_winner_notification(
        data: WinnerNotificationEmailData,
    ): Promise<Bull.Job<EmailJob> | undefined> {
        try {
            const job = await this.email_queue.add({
                type: EmailJobType.WINNER_NOTIFICATION,
                data,
            });
            return job;
        } catch (err) {
            console.error('Error adding winner notification email job to queue:', err);
            return undefined;
        }
    }
}
