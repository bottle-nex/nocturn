import axios from 'axios';
import { INVITE_COLLABORATOR_URL } from 'routes/api_routes';
import { toast } from 'sonner';

export default class EmailAction {
    static async add_collaborator(token: string, emails: string[], quizId: string, note?: string) {
        if (!token || !emails) {
            toast.error('Something went wrong while inviting collaborator.');
            return;
        }
        try {
            const { data } = await axios.post(
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
            console.log(data);
        } catch {
            toast.error('Failed to invite collaborator. Please try again.');
        }
    }
}
