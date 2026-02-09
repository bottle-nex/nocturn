import { CustomResponse, QuizType, UserQuizResponse } from '@nocturn/types';
import axios from 'axios';
import {
    CHANGE_QUIZ_TITLE_URL,
    CLEAR_TRASH_URL,
    DELETE_QUIZ_URL,
    DELETE_SELECTED_QUIZZES_URL,
    DUPLICATE_QUIZ_URL,
    GET_ALL_OWNER_QUIZ_URL,
    GET_FAVOURITE_QUIZZES_URL,
    GET_QUIZ_QUESTIONS,
    GET_SHARED_QUIZ_URL,
    GET_TRASHED_QUIZZES_URL,
    PERMANENTLY_DELETE_QUIZ_URL,
    RESTORE_TRASHED_QUIZ_URL,
    TOGGLE_FAVOURITE_QUIZ_URL,
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

    static async move_selected_quizzes_to_trash(token: string, quizIds: string[]) {
        if (!token || !Array.isArray(quizIds) || quizIds.length === 0) {
            console.error('invalid creds');
            return;
        }

        try {
            await axios.put(
                DELETE_SELECTED_QUIZZES_URL,
                {
                    quizIds,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } catch (error) {
            console.error('Error in deleting selected quizzes: ', error);
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

    static async get_shared_quizzes(token: string): Promise<UserQuizResponse | undefined> {
        try {
            const { data } = await axios.get<CustomResponse<UserQuizResponse>>(
                GET_SHARED_QUIZ_URL,
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
            console.error('Error in fetching shared quizzes: ', err);
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

    static async get_favourite_quizzes(token: string): Promise<QuizType[] | undefined> {
        if (!token) {
            console.error('token not found');
            return;
        }

        try {
            const { data } = await axios.get<CustomResponse<QuizType[]>>(
                GET_FAVOURITE_QUIZZES_URL,
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
            console.error('Failed to add quiz to favourites: ', err);
            return;
        }
    }

    static async toggle_favourite_quiz(token: string, quizId: string, isFavourite: boolean) {
        if (!token || !quizId) {
            console.error('quizId or token not found');
            return;
        }

        try {
            await axios.put(
                TOGGLE_FAVOURITE_QUIZ_URL,
                { quizId, isFavourite },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } catch (error) {
            console.error('Error in toggling favourite quiz: ', error);
            return;
        }
    }

    static async change_quiz_title(token: string, quizId: string, name: string) {
        if (!token || !quizId || !name) {
            console.error('Insufficient credentials');
            return;
        }

        try {
            await axios.put(
                CHANGE_QUIZ_TITLE_URL,
                { quizId, name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } catch (error) {
            console.error('Failed to change quiz title: ', error);
            return;
        }
    }

    static async duplicate_quiz(token: string, quizId: string): Promise<QuizType | undefined> {
        if (!token || !quizId) {
            console.error('quizId or token not foudn');
            return;
        }

        try {
            const { data } = await axios.post(
                `${DUPLICATE_QUIZ_URL}/${quizId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (data.success) {
                return data.data;
            }
        } catch (error) {
            console.error('Error in duplicating quiz: ', error);
            return;
        }
    }

    static async get_quiz_questions(token: string, quizId: string) {
        try {
            const { data } = await axios.get(`${GET_QUIZ_QUESTIONS}/${quizId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!data.success) {
                return;
            }

            return data.data;
        } catch (error) {
            console.error('error in fetching quiz questions: ', error);
            return;
        }
    }
}
