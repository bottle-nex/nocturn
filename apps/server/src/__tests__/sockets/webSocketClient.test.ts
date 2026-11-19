import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MESSAGE_TYPES } from '@nocturn/types';

vi.mock('@/lib/handle_socket_events', () => ({
    default: { handle_incoming_socket_code_event: vi.fn() },
}));
import WebSocketClient from '../../../../web/src/socket/socket.client';

class MockWebSocket {
    static OPEN = 1;
    static CONNECTING = 0;
    static instances: MockWebSocket[] = [];
    readyState = MockWebSocket.CONNECTING;
    onopen: (() => void) | null = null;
    onclose: ((event: { code: number }) => void) | null = null;
    onmessage = null;
    onerror = null;
    send = vi.fn();
    close = vi.fn();
    constructor() {
        MockWebSocket.instances.push(this);
    }
    open() {
        this.readyState = MockWebSocket.OPEN;
        this.onopen?.();
    }
}

describe('WebSocketClient', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        MockWebSocket.instances = [];
        vi.stubGlobal('WebSocket', MockWebSocket);
    });

    it('flushes queued messages in order when reconnecting without another send', () => {
        const client = new WebSocketClient('ws://localhost');
        const first = MockWebSocket.instances[0]!;
        first.open();
        first.readyState = 3;
        first.onclose?.({ code: 1006 });
        const one = { type: MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION, payload: 1 };
        const two = { type: MESSAGE_TYPES.PARTICIPANT_JOIN_GAME_SESSION, payload: 2 };
        client.send_message(one);
        client.send_message(two);
        vi.advanceTimersByTime(1000);
        const second = MockWebSocket.instances[1]!;
        second.open();
        expect(second.send.mock.calls).toEqual([[JSON.stringify(one)], [JSON.stringify(two)]]);
        expect(client.get_status().queued_messages).toBe(0);
        client.close();
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });
});
