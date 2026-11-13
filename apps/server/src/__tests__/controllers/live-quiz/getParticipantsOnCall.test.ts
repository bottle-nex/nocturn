import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'express';
import request from 'supertest';
import { buildTestApp } from '../../helpers/app.helper.ts';
import getParticipantsOnCall from '../../../controllers/live-quiz-controller/getParticipantsOnCall.ts';

const { count, findMany } = vi.hoisted(() => ({ count: vi.fn(), findMany: vi.fn() }));

vi.mock('@nocturn/database', () => ({
    prisma: { participant: { count, findMany } },
}));

const router = Router();
router.get('/quiz/participants/:quizId', getParticipantsOnCall);
const app = buildTestApp(router);
const quizId = 'quiz-id';

function seedParticipants(total: number) {
    const participants = Array.from({ length: total }, (_, index) => ({
        id: `participant-${String(index).padStart(3, '0')}`,
        nickname: `Player ${index}`,
        avatar: null,
    }));
    count.mockResolvedValue(total);
    findMany.mockImplementation(async ({ skip, take }: { skip: number; take: number }) =>
        participants.slice(skip, skip + take),
    );
    return participants;
}

describe('getParticipantsOnCall', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it.each([0, 10, 18])('returns all %i participants on the default page', async (total) => {
        const participants = seedParticipants(total);

        const response = await request(app).get(`/api/v1/quiz/participants/${quizId}`).expect(201);

        expect(response.body).toEqual({
            success: true,
            participants,
            hasMore: false,
            message: 'Participants fetched successfully',
        });
        expect(count).toHaveBeenCalledWith({ where: { quizId } });
        expect(findMany).toHaveBeenCalledWith({
            where: { quizId },
            select: { id: true, avatar: true, nickname: true },
            orderBy: { id: 'asc' },
            skip: 0,
            take: 18,
        });
    });

    it.each([19, 36, 40])(
        'paginates %i participants without omissions or duplicates',
        async (total) => {
            const participants = seedParticipants(total);
            const received = [];

            for (let page = 0; page <= Math.ceil(total / 18); page++) {
                const response = await request(app)
                    .get(`/api/v1/quiz/participants/${quizId}?page=${page}`)
                    .expect(201);

                expect(response.body.participants).toEqual(
                    participants.slice(page * 18, (page + 1) * 18),
                );
                expect(response.body.hasMore).toBe((page + 1) * 18 < total);
                received.push(...response.body.participants);
                expect(findMany).toHaveBeenLastCalledWith({
                    where: { quizId },
                    select: { id: true, avatar: true, nickname: true },
                    orderBy: { id: 'asc' },
                    skip: page * 18,
                    take: 18,
                });
            }

            expect(received).toEqual(participants);
        },
    );

    it('returns the standard error response when the database query fails', async () => {
        count.mockResolvedValue(10);
        findMany.mockRejectedValueOnce(new Error('Database unavailable'));
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            const response = await request(app)
                .get(`/api/v1/quiz/participants/${quizId}`)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        } finally {
            errorSpy.mockRestore();
        }
    });
});
