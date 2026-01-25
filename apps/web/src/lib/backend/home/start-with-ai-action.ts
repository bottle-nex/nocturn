import axios from 'axios';
import { CREATE_QUIZ_USING_AI } from 'routes/api_routes';

export default class AiBackendAction {
    static async create_quiz(token: string, sessionId: string, instruction: string) {
        try {
            const _res = await axios.post(
                CREATE_QUIZ_USING_AI,
                {
                    instruction: instruction,
                    sessionId: sessionId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            // there are 2 cases either data or stream
        } catch {
            console.error('error in creating quiz via AI');
        }
    }
}
