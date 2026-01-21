import Bull, { Job } from "bull";
import {
    CollaboratorAddedEmailData,
    CollaboratorInviteEmailData,
    EmailJob,
    EmailJobType,
} from '@nocturn/types';
import { Env } from "../configs/env";
export default class EmailServiceProcessor {
    private email_queue: Bull.Queue;

    constructor(queue_name: string) {
        this.email_queue = new Bull<EmailJob>(queue_name, Env.ORCH_REDIS_URL);
        this.setup_processor();
    }

    private setup_processor() {
        this.email_queue.process(async (job: Job<EmailJob>) => {
            const { type, data } = job.data;
            switch (type) {
                case EmailJobType.COLLABORATOR_ADDED:
                    return this.handle_collaborator_added_email(data as CollaboratorAddedEmailData);
                case EmailJobType.COLLABORATOR_INVITE:
                    return this.handle_collaborator_invite_email(data as CollaboratorInviteEmailData);
                default:
                    throw new Error(`Unknown job type: ${job.data.type}`);
            }
        });
    }

    private async handle_collaborator_added_email(data: CollaboratorAddedEmailData) {
        console.log("Handling collaborator added email", data);
    }

    private async handle_collaborator_invite_email(data: CollaboratorInviteEmailData) {
        console.log("Handling collaborator invite email", data);
    }
}