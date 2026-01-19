import axios from 'axios';
import { CREATE_QUIZ_USING_AI } from 'routes/api_routes';

export default class StartWithAIAction {
    static async create_quiz(instruction: string, token: string) {
        const res = await axios.post(
            CREATE_QUIZ_USING_AI,
            { instruction },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        const data = res.data;

        if (data.success) {
            return {
                quiz: data.quiz,
            };
        }
    }
}
