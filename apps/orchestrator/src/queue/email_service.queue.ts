import { Env } from '../configs/env';
import Bull, { Job } from 'bull';
import {
    CollaboratorAddedEmailData,
    CollaboratorInviteEmailData,
    EmailJob,
    EmailJobType,
    OtpEmailData,
} from '@nocturn/types';
import ResendService from '../services/email/resend.services';
export default class EmailServiceProcessor {
    private email_queue: Bull.Queue;

    constructor(queue_name: string) {
        this.email_queue = new Bull<EmailJob>(queue_name, Env.ORCH_REDIS_URL);
        this.setup_processor();
    }

    private setup_processor() {
        this.email_queue.process(this.read_messages.bind(this));
    }

    private async read_messages(job: Job<EmailJob>) {
        const { type, data } = job.data;
        switch (type) {
            case EmailJobType.COLLABORATOR_ADDED:
                return this.handle_collaborator_added_email(data as CollaboratorAddedEmailData);
            case EmailJobType.COLLABORATOR_INVITE:
                return this.handle_collaborator_invite_email(data as CollaboratorInviteEmailData);
            case EmailJobType.OTP_EMAIL:
                return this.handle_otp_email(data as OtpEmailData);
            default:
                throw new Error(`Unknown job type: ${job.data.type}`);
        }
    }

    private async handle_collaborator_added_email(data: CollaboratorAddedEmailData) {
        await ResendService.send_collaborator_added_email(data);
    }

    private async handle_collaborator_invite_email(data: CollaboratorInviteEmailData) {
        await ResendService.send_collaborator_invited_email(data);
    }

    private async handle_otp_email(data: OtpEmailData) {
        await ResendService.send_otp_email(data);
    }
}
