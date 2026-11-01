import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebSocketClient from '../../../../web/src/socket/socket.client';

vi.mock('@/lib/handle_socket_events', () => ({
    default: { handle_incoming_socket_code_event: vi.fn() },
}));

class MockWebSocket {
    static OPEN = 1;
    static CONNECTING = 0;
    static instances: MockWebSocket[] = [];
    readyState = MockWebSocket.CONNECTING;
    onopen = () => {};
    onclose = (_event: { code: number }) => {};
    close = vi.fn();

    constructor() {
        MockWebSocket.instances.push(this);
    }

    static instance(index: number) {
        const socket = MockWebSocket.instances[index];
        if (!socket) throw new Error(`Missing socket ${index}`);
        return socket;
    }

    open() {
        this.readyState = MockWebSocket.OPEN;
        this.onopen();
    }
}

describe('live socket connection notifications', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        MockWebSocket.instances = [];
        vi.stubGlobal('WebSocket', MockWebSocket);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('notifies subscribers after initial connection and reconnect so they can reload state', () => {
        const client = new WebSocketClient('ws://localhost/ws?quizId=quiz');
        const synchronize = vi.fn();
        client.subscribe_to_connection(synchronize);
        MockWebSocket.instance(0).open();
        expect(synchronize).toHaveBeenCalledTimes(1);
        MockWebSocket.instance(0).onclose({ code: 1006 });
        vi.advanceTimersByTime(1000);
        MockWebSocket.instance(1).open();
        expect(synchronize).toHaveBeenCalledTimes(2);
        client.close();
    });

    it('removes subscriptions when a live page unmounts', () => {
        const client = new WebSocketClient('ws://localhost/ws?quizId=quiz');
        const synchronize = vi.fn();
        const unsubscribe = client.subscribe_to_connection(synchronize);
        unsubscribe();
        MockWebSocket.instance(0).open();
        expect(synchronize).not.toHaveBeenCalled();
        client.close();
    });

    it('stops reconnecting after a deliberate close', () => {
        const client = new WebSocketClient('ws://localhost/ws?quizId=quiz');
        const synchronize = vi.fn();
        client.subscribe_to_connection(synchronize);
        client.close();
        MockWebSocket.instance(0).onclose({ code: 1006 });
        vi.advanceTimersByTime(60000);
        expect(MockWebSocket.instances).toHaveLength(1);
        expect(synchronize).not.toHaveBeenCalled();
    });
});
