import { EventEmitter } from 'events';
import { describe, expect, it, vi } from 'vitest';
import { prisma } from '@nocturn/database';
import CollaborationManager from '../../sockets/CollaborationManager';

describe('CollaborationManager connections', () => {
    it('keeps another tab connected when a tab closes', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user' } as any);
        const sockets = new Map();
        const sessions = new Map();
        const manager = new CollaborationManager({
            socket_mapping: sockets,
            collaborator_sockets_mapping: sessions,
            collaborators_state_manager: { on_collaborators_connect: vi.fn() },
        } as any);
        const first = Object.assign(new EventEmitter(), { close: vi.fn() });
        const second = Object.assign(new EventEmitter(), { close: vi.fn() });
        const payload = { userId: 'user', collabSessionId: 'session', quizId: 'quiz' } as any;

        await manager.handle_connection(first as any, payload);
        await manager.handle_connection(second as any, payload);

        expect(first.close).not.toHaveBeenCalled();
        expect(sockets.size).toBe(2);
        expect(sessions.get('session').size).toBe(2);

        first.emit('close');
        expect(sockets.size).toBe(1);
        expect(sessions.get('session').size).toBe(1);
        expect([...sockets.values()]).toEqual([second]);
    });
});
