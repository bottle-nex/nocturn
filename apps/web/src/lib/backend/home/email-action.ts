import axios from 'axios';
import { INVITE_COLLABORATOR_URL } from 'routes/api_routes';
import { toast } from '@/lib/toast';

export default class EmailAction {
    static async add_collaborator(token: string, emails: string[], quizId: string, note?: string) {
        if (!token || !emails) {
            toast.error('Something went wrong while inviting collaborator.');
            return;
        }
        try {
            await axios.post(
                `${INVITE_COLLABORATOR_URL}/${quizId}`,
                {
                    emails,
                    note,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } catch {
            toast.error('Failed to invite collaborator. Please try again.');
        }
    }
}
