import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import generateNewQuizController from '../../../controllers/ai-controller/generateNewQuizController';
import authMiddleware from '../../../middlewares/auth.middleware';
import { buildRouteApp } from '../../helpers/app.helper';
import { generateAccessToken } from '../../helpers/auth.helper';

const mocks = vi.hoisted(() => ({
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    stream: vi.fn(),
}));
vi.mock('@nocturn/database', () => ({
    AiQuizChatRole: { USER: 'USER' },
    prisma: {
        aiQuizChatSession: { findUnique: mocks.findUnique, create: mocks.create },
        aiQuizMessage: { create: vi.fn(), findMany: mocks.findMany },
    },
}));
vi.mock('../../../services/init.services', () => ({ quizAgentGraph: { stream: mocks.stream } }));
vi.mock('../../../gen/agents/Agent', () => ({ default: { create_stream: vi.fn() } }));
const app = buildRouteApp('post', '/generate', authMiddleware, generateNewQuizController);

describe('bounded AI conversation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.create.mockResolvedValue({ id: 'session', userId: 'user', step: 'START' });
        mocks.stream.mockResolvedValue(
            (async function* () {
                yield {};
            })(),
        );
    });

    it('loads only the latest messages, restores chronological order and bounds legacy content', async () => {
        mocks.findMany.mockResolvedValue([
            { role: 'USER', content: 'newest' },
            { role: 'ASSISTANT', content: 'older' },
        ]);
        await request(app)
            .post('/generate')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ instruction: 'Quiz' })
            .expect(200);
        expect(mocks.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 20,
                orderBy: { createdAt: 'desc' },
            }),
        );
        expect(mocks.stream.mock.calls[0]?.[0].conversationHistory).toBe(
            'ASSISTANT: older\nUSER: newest',
        );

        mocks.findMany.mockResolvedValue(
            Array.from({ length: 20 }, () => ({ role: 'USER', content: 'x'.repeat(10000) })),
        );
        await request(app)
            .post('/generate')
            .set('Authorization', `Bearer ${generateAccessToken()}`)
            .send({ instruction: 'Quiz' })
            .expect(200);
        expect(mocks.stream.mock.calls[1]?.[0].conversationHistory.length).toBeLessThanOrEqual(
            16000,
        );
    });
});
