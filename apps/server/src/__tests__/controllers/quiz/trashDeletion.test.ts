import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { buildTestApp } from '../../helpers/app.helper';
import { bearerHeader, TEST_USER } from '../../helpers/auth.helper';
import quizRouter from '../../../routes/quiz.router';
import cleanupTrashedQuizzes from '../../../jobs/cleanup-trashed-quizzes';

// Deletion never uses Solana, but the imported server config requires this setting.
vi.hoisted(() => {
    vi.stubEnv('SERVER_PLATFORM_AUTHORITY_KEYPAIR', 'unused-in-trash-tests');
});

const db = vi.hoisted(() => ({
    findUnique: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
}));
vi.mock('@nocturn/database', () => ({
    prisma: { quiz: db },
    QuizStatus: { LIVE: 'LIVE' },
}));
const app = buildTestApp(quizRouter);
const quiz = { id: 'shared', status: 'CREATED', title: 'Shared quiz', description: '' };
const singleUrl = '/api/v1/quiz/delete-quiz/shared';
const bulkUrl = '/api/v1/quiz/clear-trash';

describe('trash deletion', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        db.findUnique.mockResolvedValue(quiz);
        db.findMany.mockResolvedValue([{ id: 'shared' }, { id: 'other' }]);
        db.delete.mockResolvedValue(quiz);
        db.deleteMany.mockResolvedValue({ count: 1 });
    });
    it('deletes an owned trashed quiz with guarded predicates', async () => {
        const response = await request(app)
            .delete(singleUrl)
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(response.body.data.id).toBe('shared');
        expect(db.delete).toHaveBeenCalledWith({
            where: { id: 'shared', hostId: TEST_USER.id, isDeleted: true, status: { not: 'LIVE' } },
        });
    });
    it('reports a database failure instead of deletion success', async () => {
        db.delete.mockRejectedValueOnce(new Error('foreign key'));
        const response = await request(app)
            .delete(singleUrl)
            .set('Authorization', bearerHeader())
            .expect(500);
        expect(response.body.success).toBe(false);
    });
    it('rejects live quizzes', async () => {
        db.findUnique.mockResolvedValueOnce({ ...quiz, status: 'LIVE' });
        await request(app).delete(singleUrl).set('Authorization', bearerHeader()).expect(400);
        expect(db.delete).not.toHaveBeenCalled();
    });
    it('does not delete a missing, unowned, or non-trashed quiz', async () => {
        db.findUnique.mockResolvedValueOnce(null);
        await request(app).delete(singleUrl).set('Authorization', bearerHeader()).expect(404);
        expect(db.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'shared', hostId: TEST_USER.id, isDeleted: true },
            }),
        );
        expect(db.delete).not.toHaveBeenCalled();
    });
    it('requires authentication', async () => {
        await request(app).delete(bulkUrl).expect(401);
        expect(db.findMany).not.toHaveBeenCalled();
    });
    it('continues emptying trash after one quiz fails', async () => {
        db.deleteMany.mockRejectedValueOnce(new Error('blocked'));
        const response = await request(app)
            .delete(bulkUrl)
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(response.body.data).toEqual({ deletedIds: ['other'], failedIds: ['shared'] });
        expect(db.deleteMany).toHaveBeenCalledTimes(2);
        expect(db.deleteMany).toHaveBeenLastCalledWith({
            where: { hostId: TEST_USER.id, id: 'other', isDeleted: true, status: { not: 'LIVE' } },
        });
    });
    it('reports guarded deletes that no longer match as failures', async () => {
        db.deleteMany.mockResolvedValueOnce({ count: 0 });
        const response = await request(app)
            .delete(bulkUrl)
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(response.body.data).toEqual({ deletedIds: ['other'], failedIds: ['shared'] });
    });
    it('returns an empty result for empty trash', async () => {
        db.findMany.mockResolvedValueOnce([]);
        const response = await request(app)
            .delete(bulkUrl)
            .set('Authorization', bearerHeader())
            .expect(200);
        expect(response.body.data).toEqual({ deletedIds: [], failedIds: [] });
        expect(db.deleteMany).not.toHaveBeenCalled();
    });
    it('limits selected deletion to the owner and requested ids', async () => {
        await request(app)
            .post('/api/v1/quiz/permanently-delete-selected-quiz')
            .set('Authorization', bearerHeader())
            .send({ quizIds: ['shared', 'other'] })
            .expect(200);
        expect(db.findMany).toHaveBeenCalledWith({
            where: { id: { in: ['shared', 'other'] }, hostId: TEST_USER.id, isDeleted: true },
            select: { id: true },
        });
    });
    it('cleans quizzes at least 30 days old independently and guards the cutoff again', async () => {
        vi.spyOn(Date, 'now').mockReturnValueOnce(Date.parse('2026-11-19T02:00:00Z'));
        db.deleteMany.mockRejectedValueOnce(new Error('blocked'));
        await cleanupTrashedQuizzes();
        const deletedAt = { lte: new Date('2026-10-20T02:00:00Z') };
        expect(db.findMany).toHaveBeenCalledWith({
            where: { deletedAt, isDeleted: true },
            select: { id: true },
        });
        expect(db.deleteMany).toHaveBeenLastCalledWith({
            where: { deletedAt, id: 'other', isDeleted: true, status: { not: 'LIVE' } },
        });
    });
});
