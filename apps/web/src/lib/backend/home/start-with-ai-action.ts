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

        const { appendMessage } = useAiChatStore.getState();
        
        switch(stream.type) {
            case(STREAM.MESSAGE): {
                appendMessage(stream.data as AiQuizMessage);
            }
        }

    }

}
