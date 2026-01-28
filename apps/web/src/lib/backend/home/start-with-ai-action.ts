import { useAiChatStore } from '@/store/home/useAiChatStore';
import { AiQuizMessage, STREAM, stream } from '@nocturn/types';
import axios from 'axios';
import { CREATE_QUIZ_USING_AI } from 'routes/api_routes';

export default class AiBackendAction {
    static async create_quiz(token: string, sessionId: string, instruction: string) {
        const { appendMessage, setLoading } = useAiChatStore.getState();

        try {
            setLoading(true);

            const res = await axios.post(
                CREATE_QUIZ_USING_AI,
                {
                    instruction,
                    sessionId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    responseType: 'text',
                },
            );

            const contentType = res.headers['content-type'] ?? '';

            // handle stream
            if (contentType.includes('text/event-stream')) {
                // handle here
                this.handle_stream(res.data.data);
                return;
            }

            const parsed = JSON.parse(res.data);
            appendMessage(parsed.data.agenticMessage);
        } catch (err) {
            console.error('error in creating quiz via AI', err);
        } finally {
            setLoading(false);
        }
    }

    static handle_stream(stream: stream) {
        const { appendMessage, setSessionId, appendMultipleMessages } = useAiChatStore.getState();

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
        }
    }

    static async create_new_quiz(token: string, sessionId: string, instruction: string) {
        const { setLoading } = useAiChatStore.getState();

        try {
            setLoading(false);

            const response = await fetch(CREATE_QUIZ_USING_AI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    sessionId,
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
}
