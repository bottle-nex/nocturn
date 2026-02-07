import { CustomResponse, getUnAskedQuestionResponse, QuestionType } from '@nocturn/types';
import axios from 'axios';
import { GET_SELECTED_QUESTION_DATA, GET_UN_ASKED_QUESTION_URL } from 'routes/api_routes';

export default class LiveQuizBackendActions {
    static async getQuestionDetailByIndex(quizId: string, questionIndex: number, token: string) {
        if (!quizId || questionIndex == null || questionIndex < 0 || !token) {
            console.error('Invalid parameters for getQuestionDetailByIndex');
            return null;
        }

        try {
            const { data } = await axios.get(
                `${GET_SELECTED_QUESTION_DATA}/${quizId}/${questionIndex}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (data.success) {
                return data.question;
            } else {
                console.error('Backend returned unsuccessful response:', data.message);
                return null;
            }
        } catch (err) {
            console.warn(`Question at index ${questionIndex} not found`, err);
            return null;
        }
    }

    static async getUnAskedQuestion(
        token: string,
        quizId: string,
    ): Promise<{ end: boolean; question: QuestionType | null } | null> {
        try {
            const { data: response } = await axios.get<CustomResponse<getUnAskedQuestionResponse>>(
                `${GET_UN_ASKED_QUESTION_URL}/${quizId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (response.success && response.data) {
                return {
                    end: response.data.end,
                    question: response.data.question,
                };
            }

            return null;
        } catch (error) {
            console.error('error while fetching question');
            return null;
        }
    }
}
