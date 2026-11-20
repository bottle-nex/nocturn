import { describe, expect, it, vi } from 'vitest';
import { once } from 'node:events';
import { WebSocket, WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { USER_TYPE } from '@nocturn/types';
vi.mock('../../configs/env', () => ({
    env: { SERVER_JWT_SECRET: 'socket-readiness-test-secret' },
}));
vi.mock('../../sockets/HostManager', () => ({ default: vi.fn() }));
vi.mock('../../sockets/ParticipantManager', () => ({ default: vi.fn() }));
vi.mock('../../sockets/SpectatorManager', () => ({ default: vi.fn() }));
vi.mock('../../sockets/CollaborationManager', () => ({ default: vi.fn() }));
vi.mock('../../sockets/SubscriberManager', () => ({ default: vi.fn() }));
vi.mock('../../sockets/CollaboratorsStateManager', () => ({ default: vi.fn() }));
import WebsocketServer from '../../sockets/socket.server';
import type { CustomWebSocket } from '../../types/web-socket-types';
import { env } from '../../configs/env';

describe('socket authentication readiness', () => {
    it.each([USER_TYPE.HOST, USER_TYPE.PARTICIPANT])(
        'retains transport-open messages during asynchronous %s authentication',
        async (role) => {
            let authorize: () => void = () => {
                throw new Error('Authentication gate not initialized');
            };
            const authentication = new Promise<void>((resolve) => {
                authorize = resolve;
            });
            let receivedRequest: () => void = () => {
                throw new Error('Receive gate not initialized');
            };
            const received = new Promise<void>((resolve) => {
                receivedRequest = resolve;
            });
            const messages: string[] = [];
            const manager = {
                handle_connection: async (ws: CustomWebSocket) => {
                    await authentication;
                    ws.on('message', (data) => {
                        messages.push(data.toString());
                        receivedRequest();
                    });
                },
            };
            const application: WebsocketServer = Object.create(WebsocketServer.prototype);
            Object.assign(application, {
                subscriber: { subscribe: vi.fn() },
                hostManager: manager,
                participant_manager: manager,
            });
            const transport = new WebSocketServer({ port: 0, host: '127.0.0.1' });
            await once(transport, 'listening');
            const address = transport.address();
            if (typeof address !== 'object' || address === null)
                throw new Error('Missing server address');
            const token = jwt.sign(
                { quizId: 'quiz', gameSessionId: 'session', userId: 'user', role },
                env.SERVER_JWT_SECRET,
            );
            const connected = new Promise<CustomWebSocket>((resolve) => {
                transport.on('connection', (socket) => {
                    const ws = Object.assign(socket, { id: 'socket' });
                    void application['extract_token'](ws, token, 'quiz');
                    resolve(ws);
                });
            });
            const client = new WebSocket(`ws://127.0.0.1:${address.port}`);
            try {
                await once(client, 'open');
                const socket = await connected;
                const request = JSON.stringify({ type: 'HOST_CHANGE_QUIZ_RESULTS', payload: {} });
                await new Promise<void>((resolve, reject) =>
                    client.send(request, (error) => (error ? reject(error) : resolve())),
                );
                expect(socket.isPaused).toBe(true);
                expect(messages).toEqual([]);
                authorize();
                await received;
                expect(socket.isPaused).toBe(false);
                expect(messages).toEqual([request]);
            } finally {
                authorize();
                client.terminate();
                for (const socket of transport.clients) socket.terminate();
                await new Promise<void>((resolve) => transport.close(() => resolve()));
            }
        },
    );
});
