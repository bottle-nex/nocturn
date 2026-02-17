import { useAiChatStore } from '@/store/home/useAiChatStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { AiQuizMessage, QuizType, STREAM, stream } from '@nocturn/types';
import { GENERATE_NEW_QUIZ } from 'routes/api_routes';

export default class AiBackendAction {
    static async create_new_quiz(token: string, sessionId: string | null, instruction: string) {
        const { setLoading } = useAiChatStore.getState();
        try {
            setLoading(false);

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
                throw new Error('Failed to start chat');
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
        } finally {
            setLoading(false);
        }
    }

    static handle_stream(stream: stream) {
        console.log('streaming event: ', stream);
        const { appendMessage, setSessionId, appendMultipleMessages, setQuiz } =
            useAiChatStore.getState();
        const { updateQuiz } = useNewQuizStore.getState();
        switch (stream.type) {
            case STREAM.MESSAGE: {
                appendMessage(stream.data as AiQuizMessage);
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
}
