import { QuizType } from '@nocturn/types';
import axios from 'axios';
import { CREATE_QUIZ_URL, LAUNCH_QUIZ_URL, PUBLISH_QUIZ_URL } from 'routes/api_routes';

export default class BackendActions {
    static async createQuiz(token: string): Promise<QuizType | null> {
        if (!token) return null;

        try {
            const { data } = await axios.post(
                CREATE_QUIZ_URL,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            if (data.success) {
                return data.data as QuizType;
            }
            return null;
        } catch (error) {
            console.error('failed to create quiz', error);
            return null;
        }
    }

    static async upsertQuizAction(quiz: QuizType, token: string): Promise<boolean> {
        if (!token || !quiz.id) {
            return false;
        }
        try {
            const { data } = await axios.post(`${CREATE_QUIZ_URL}/${quiz.id}`, quiz, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.success) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('[UPSERT_QUIZ_ERROR]', err);
            return false;
        }
    }

    static async publishQuiz(quiz: QuizType, token: string): Promise<boolean> {
        if (!token || !quiz) {
            return false;
        }

        try {
            const { data } = await axios.post(`${PUBLISH_QUIZ_URL}/${quiz.id}`, quiz, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (data.success) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('[PUBLISH_QUIZ_ERROR]', err);
            return false;
        }
    }

    static async launchQuiz(quiz: QuizType, token: string): Promise<boolean> {
        if (!token || !quiz) {
            return false;
        }
        try {
            const { data } = await axios.post(`${LAUNCH_QUIZ_URL}/${quiz.id}`, quiz, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (data.success) {
                return true;
            }
            return false;
        } catch (err) {
            console.error('[LAUNCH_QUIZ_ERROR]', err);
            return false;
        }
    }
}
