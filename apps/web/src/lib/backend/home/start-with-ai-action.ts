import { toast } from '@/lib/toast';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { AiQuizMessage, QuizType, STREAM, stream } from '@nocturn/types';
import axios from 'axios';
import {
    ACCEPT_OR_DECLINE_GENERATED_QUIZ,
    AI_USAGE_URL,
    GENERATE_NEW_QUIZ,
} from 'routes/api_routes';

export default class AiBackendAction {
    static async refresh_usage(token: string) {
        const { setUsage, setUsageError } = useAiChatStore.getState();
        setUsageError(null);
        try {
            const response = await fetch(AI_USAGE_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Unable to load AI usage');
            const body = await response.json();
            setUsage(body.data);
        } catch {
            setUsage(null);
            setUsageError('Unable to load AI usage. Please try again.');
        }
    }

    static async create_new_quiz(token: string, sessionId: string | null, instruction: string) {
        const { setLoading } = useAiChatStore.getState();
        try {
            setLoading(true);

            const response = await fetch(GENERATE_NEW_QUIZ, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...(sessionId && { sessionId }),
                    instruction,
                }),
            });

            if (!response.ok) {
                const body = await response.json();
                throw new Error(body.message || 'Failed to start chat');
            }

            const reader = response.body?.getReader();

            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    try {
                        const jsonString = trimmed.startsWith('data: ')
                            ? trimmed.slice(6)
                            : trimmed;
                        const event: stream = JSON.parse(jsonString);

                        this.handle_stream(event);
                    } catch {
                        console.error('Skipping incomplete streaming message');
                    }
                }
            }
        } catch (error) {
            console.error('error in streaming data: ', error);
            toast.error(error instanceof Error ? error.message : 'Failed to start chat');
        } finally {
            await AiBackendAction.refresh_usage(token);
            setLoading(false);
        }
    }

    static handle_stream(stream: stream) {
        const {
            loading,
            appendMessage,
            setSessionId,
            appendMultipleMessages,
            setQuiz,
            setLoading,
            addTypingMessage,
        } = useAiChatStore.getState();
        if (!loading) {
            setLoading(true);
        }
        switch (stream.type) {
            case STREAM.MESSAGE: {
                const message = stream.data as AiQuizMessage;
                appendMessage(message);
                addTypingMessage(message.id);
                return;
            }
            case STREAM.ID: {
                setSessionId(stream.data as string);
                return;
            }
            case STREAM.MESSAGES: {
                appendMultipleMessages(stream.data as AiQuizMessage[]);
                return;
            }
            case STREAM.QUIZ: {
                setQuiz(stream.data as QuizType);
                return;
            }
        }
    }

    static async handle_quiz_accept_or_decline(token: string, sessionId: string, decline: boolean) {
        try {
            await axios.post(
                ACCEPT_OR_DECLINE_GENERATED_QUIZ,
                {
                    sessionId,
                    decline,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
        } catch {
            console.error('error in continuing to this quiz');
        }
    }
}
