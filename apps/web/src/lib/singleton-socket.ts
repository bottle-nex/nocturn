import WebSocketClient from '@/socket/socket.client';

let client: WebSocketClient | null = null;
let currentQuizId: string | null = null;

export function getWebSocketClient(quizId: string) {
    if (client && currentQuizId === quizId) {
        return client;
    }

    if (client && currentQuizId !== quizId) {
        client.close();
        client = null;
    }
    client = new WebSocketClient(`ws://localhost:8080/ws?quizId=${quizId}`);
    currentQuizId = quizId;
    return client;
}

export function cleanWebSocketClient() {
    if (client) {
        client.close();
    }
    client = null;
    currentQuizId = null;
}

export function getCurrentQuizId() {
    return currentQuizId;
}
