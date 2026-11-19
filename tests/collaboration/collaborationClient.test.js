import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WebSocketClient from '../../apps/web/src/socket/socket.client';
const COLLABORATORS_MESSAGE_TYPE = { QUESTION_UPDATE: 'QUESTION_UPDATE' };

const mocks = vi.hoisted(() => ({
    toast: Object.assign(
        vi.fn(() => 'reconnecting'),
        { dismiss: vi.fn() },
    ),
}));
vi.mock('@/lib/toast', () => ({ toast: mocks.toast }));
vi.mock('@/lib/handle_socket_events', () => ({
    default: { handle_incoming_socket_code_event: vi.fn() },
}));

class BrowserSocket {
    static OPEN = 1;
    static CONNECTING = 0;
    static instances = [];
    readyState = 0;
    onopen = null;
    onclose = null;
    onmessage = null;
    onerror = null;
    send = vi.fn();
    close = vi.fn();
    constructor() {
        BrowserSocket.instances.push(this);
    }
    open() {
        this.readyState = 1;
        this.onopen?.();
    }
    drop() {
        this.readyState = 3;
        this.onclose?.({ code: 1006 });
    }
}
const firstEdit = {
    type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE,
    payload: { questionIndex: 3, question: { question: 'First edit' } },
};
const secondEdit = {
    type: COLLABORATORS_MESSAGE_TYPE.QUESTION_UPDATE,
    payload: { questionIndex: 5, question: { question: 'Second edit' } },
};

describe('collaboration client reconnect replay', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        BrowserSocket.instances = [];
        vi.stubGlobal('WebSocket', BrowserSocket);
    });
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('flushes queued edits on open without waiting for another edit', () => {
        const client = new WebSocketClient('ws://localhost/ws');
        client.send_message(firstEdit);
        client.send_message(secondEdit);
        const ws = BrowserSocket.instances[0];
        ws.open();
        expect(ws.send.mock.calls).toEqual([
            [JSON.stringify(firstEdit)],
            [JSON.stringify(secondEdit)],
        ]);
        expect(client.get_status().queued_messages).toBe(0);
        client.close();
    });

    it('shows reconnecting and replays offline edits in order after reconnecting', () => {
        const client = new WebSocketClient('ws://localhost/ws');
        const first = BrowserSocket.instances[0];
        first.open();
        first.drop();
        expect(mocks.toast).toHaveBeenCalledWith('Reconnecting…', { duration: Infinity });
        client.send_message(firstEdit);
        client.send_message(secondEdit);
        vi.advanceTimersByTime(1000);
        const second = BrowserSocket.instances[1];
        second.open();
        expect(second.send.mock.calls).toEqual([
            [JSON.stringify(firstEdit)],
            [JSON.stringify(secondEdit)],
        ]);
        expect(mocks.toast.dismiss).toHaveBeenCalledWith('reconnecting');
        client.close();
    });

    it('does not reconnect after access is revoked', () => {
        const client = new WebSocketClient('ws://localhost/ws');
        BrowserSocket.instances[0].onclose?.({ code: 3003 });
        vi.advanceTimersByTime(60000);
        expect(BrowserSocket.instances).toHaveLength(1);
        client.close();
    });
});
