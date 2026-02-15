import WebSocketClient from '@/socket/socket.client';

let client: WebSocketClient | null = null;
let currentQuizId: string | null = null;

export function getWebSocketClient(quizId: string) {
    console.log("creating socket using quiz id is : ", quizId)
    if (client && currentQuizId === quizId) {
        console.log('returning client 1');
        return client;
    }

    if (client && currentQuizId !== quizId) {
        client.close();
        client = null;
    }
    client = new WebSocketClient(`ws://localhost:8080/ws?quizId=${quizId}`);
    currentQuizId = quizId;
    console.log('returning client 2');
    return client;
}

export function cleanWebSocketClient() {
    if (client) {
        console.log("closing the client connection")
        client.close();
    }
    client = null;
    currentQuizId = null;
}

export function getCurrentQuizId() {
    return currentQuizId;
}
