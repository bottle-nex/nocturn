import { toast } from '@/lib/toast';
import { QuizType } from '@nocturn/types';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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

    static async launchQuiz(
        quiz: QuizType,
        token: string,
        router: ReturnType<typeof useRouter>,
    ): Promise<boolean> {
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
            let message = 'unknown error';

            if (axios.isAxiosError(err)) {
                const data = err.response?.data.data;
                toast(data.title, {
                    description: data.description,
                    descriptionClassName: 'text-xs ',
                    action: {
                        label: 'Upgrade to Pro',
                        onClick: () => {
                            router.push('/premium');
                        },
                    },
                    actionButtonStyle: {
                        background: 'white',
                        color: 'black',
                        borderRadius: '3px',
                        cursor: 'pointer',
                    },
                });
            } else if (err instanceof Error) {
                message = err.message;
                toast.error(message);
            } else {
                toast.error(message);
            }
            console.error('[LAUNCH_QUIZ_ERROR]', err);
            return false;
        }
    }
}
