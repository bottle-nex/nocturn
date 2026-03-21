import WebSocketClient from '@/socket/socket.client';

let client: WebSocketClient | null = null;
let currentQuizId: string | null = null;

function getWsUrl(quizId: string): string {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    const url = new URL(backendUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws';
    url.searchParams.set('quizId', quizId);
    return url.toString();
}

export function getWebSocketClient(quizId: string) {
    if (client && currentQuizId === quizId) {
        return client;
    }

    if (client && currentQuizId !== quizId) {
        client.close();
        client = null;
    }
    client = new WebSocketClient(getWsUrl(quizId));
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
