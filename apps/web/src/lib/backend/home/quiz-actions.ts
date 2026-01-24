import { CustomResponse, QuizType, UserQuizResponse } from '@nocturn/types';
import axios from 'axios';
import {
    CLEAR_TRASH_URL,
    DELETE_QUIZ_URL,
    GET_ALL_OWNER_QUIZ_URL,
    GET_TRASHED_QUIZZES_URL,
    PERMANENTLY_DELETE_QUIZ_URL,
    RESTORE_TRASHED_QUIZ_URL,
} from 'routes/api_routes';

export type TrashedQuizWithDaysLedt = QuizType & {
    daysLeftUntilPermanentDeletion?: number | null;
};

export default class QuizActions {
    static async get_trashed_quizzes(
        token: string,
    ): Promise<TrashedQuizWithDaysLedt[] | undefined> {
        try {
            const { data } = await axios.get<CustomResponse<TrashedQuizWithDaysLedt[]>>(
                GET_TRASHED_QUIZZES_URL,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (data.success) return data.data;
        } catch (err) {
            console.error('Error in fetching trashed quizzes: ', err);
            return;
        }
    }

    // move to trash
    static async delete_quiz(token: string, quizId: string) {
        try {
            await axios.put(
                `${DELETE_QUIZ_URL}/${quizId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } catch (error) {
            console.error('Error in deleting quiz: ', error);
            return;
        }
    }

    static async get_quizzes(token: string): Promise<UserQuizResponse | undefined> {
        try {
            const { data } = await axios.get<CustomResponse<UserQuizResponse>>(
                GET_ALL_OWNER_QUIZ_URL,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (data.success) {
                return data.data;
            }
        } catch (err) {
            console.error('Error in fetching quizzes: ', err);
            return;
        }
    }

    static async delete_all_trashed_quizzes(token: string) {
        try {
            await axios.delete(CLEAR_TRASH_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Failed to clear trash: ', error);
            return;
        }
    }

    static async restore_trashed_quiz(token: string, quizId: string) {
        try {
            const { data } = await axios.put(
                `${RESTORE_TRASHED_QUIZ_URL}/${quizId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            return data.data;
        } catch (error) {
            console.error('Failed to restore quiz: ', error);
            return;
        }
    }

    static async permanently_delete_quiz(token: string, quizId: string) {
        try {
            const { data } = await axios.delete(`${PERMANENTLY_DELETE_QUIZ_URL}/${quizId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return data.data;
        } catch (error) {
            console.error('Error in permanently deleting quiz: ', error);
            return;
        }
    }
}
