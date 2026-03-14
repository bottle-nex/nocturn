import axios from 'axios';
import {
    HOST_JOIN_QUIZ_URL,
    PARTICIPANT_JOIN_QUIZ_URL,
    SPECTATOR_JOIN_QUIZ_URL,
    SPECTATOR_JOIN_QUIZ_URL_VIA_LINK,
} from 'routes/api_routes';
import { toast } from '@/lib/toast';
import { useRejoinPanelStore } from '@/store/base/useRejoinPanelStore';

interface JoinQuizResponse {
    quizId: string;
}

class UserQuizAction {
    public async joinQuiz(
        code: string,
        email?: string,
        name?: string,
        force = false,
    ): Promise<JoinQuizResponse | null> {
        switch (code.length) {
            case 6:
                return await this.spectatorJoinQuiz(code, force);
            case 12:
                return await this.participantJoinQuiz(code, email!, name, force);
            default:
                toast.error('Please enter a valid code');
                return null;
        }
    }

    public async hostJoinQuiz(quizId: string, token: string) {
        try {
            if (!quizId) {
                toast.error('Invalid quiz id');
                return null;
            }

            const { data } = await axios.post(
                HOST_JOIN_QUIZ_URL,
                { quizId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                },
            );

            if (data.success) {
                toast.success(data.message);
                return data.data;
            }
            toast.error(data.message);
            return null;
        } catch (error) {
            console.error('Error while joining quiz', error);
            return null;
        }
    }

    private async participantJoinQuiz(
        code: string,
        email: string,
        name?: string,
        force = false,
    ): Promise<JoinQuizResponse | null> {
        try {
            const { setData, setJoinData } = useRejoinPanelStore.getState();
            if (!code || !email.trim()) {
                toast.error('Please enter a code and email');
                return null;
            }
            if (code.length !== 12) {
                toast.error('Please enter a valid code');
                return null;
            }

            const { data } = await axios.post(
                PARTICIPANT_JOIN_QUIZ_URL,
                { code, email, name, force },
                { withCredentials: true },
            );
            if (data.success && data.code === "ALREADY_A_MEMBER") {
                setData(data.message, data.join_back, data.join_as || null);
                setJoinData(name || null, email, code);
                return null;
            } else if (data.success) {
                toast.success(data.message);
                return data.data;
            }
            toast.error(data.message);
            return null;
        } catch (err) {
            let message = 'unknown error';
            if (axios.isAxiosError(err)) {
                message = err.response?.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            toast.error(message);
            return null;
        }
    }

    private async spectatorJoinQuiz(code: string, force = false): Promise<JoinQuizResponse | null> {
        try {
            if (!code) {
                toast.error('Please enter a code');
                return null;
            }
            if (code.length !== 6) {
                toast.error('Please enter a valid code');
                return null;
            }

            const { data } = await axios.post(
                SPECTATOR_JOIN_QUIZ_URL,
                { code, force },
                { withCredentials: true },
            );

            if (data.success) {
                toast.success(data.message);
                return data.data;
            }
            toast.error(data.message);
            return null;
        } catch (err) {
            console.error('Error while joining quiz', err);
            return null;
        }
    }

    public async spectatorJoinQuizViaURL(
        quizId: string,
        spectatorToken: string,
    ): Promise<{
        quizId: string;
        success: boolean;
    }> {
        try {
            if (!quizId) {
                toast.error('Quiz ID is missing');
                return {
                    quizId: '',
                    success: false,
                };
            }

            if (!spectatorToken) {
                toast.error('Spectator token is missing');
                return {
                    quizId: '',
                    success: false,
                };
            }

            const { data } = await axios.get(
                `${SPECTATOR_JOIN_QUIZ_URL_VIA_LINK}?quizId=${quizId}&spectator_token=${spectatorToken}`,
                { withCredentials: true },
            );

            if (data.success) {
                toast.success(data.message);
                return {
                    quizId: data.quizId,
                    success: data.success,
                };
            }

            toast.error(data.message);
            return {
                quizId: '',
                success: false,
            };
        } catch (err) {
            console.error('Error while joining quiz via URL', err);
            toast.error('Failed to join quiz. Please try again.');

            return {
                quizId: '',
                success: false,
            };
        }
    }
}

const userQuizAction = new UserQuizAction();
export default userQuizAction;
