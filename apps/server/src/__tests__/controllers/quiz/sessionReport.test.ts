import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from 'express';

// The shared .env.test predates this required setting. No Solana calls run here.
vi.hoisted(() => {
    process.env.SERVER_PLATFORM_AUTHORITY_KEYPAIR ??= 'session-report-test-placeholder';
});
import request from 'supertest';
import { prisma } from '@nocturn/database';
import { buildTestApp } from '../../helpers/app.helper';
import { bearerHeader, TEST_USER } from '../../helpers/auth.helper';
import authMiddleware from '../../../middlewares/auth.middleware';
import {
    sessionHistory,
    sessionReport,
} from '../../../controllers/quiz-controller/sessionReportController';
import { build_session_report, csv, type ReportSource } from '../../../services/session-report';

const router = Router();
router.get('/quiz/sessions', authMiddleware, sessionHistory);
router.get('/quiz/session-report/:quizId', authMiddleware, sessionReport);
const app = buildTestApp(router);

function fixture(): ReportSource & { GameSession: NonNullable<ReportSource['GameSession']> } {
    const player = (id: string, totalScore: number) => ({
        id,
        nickname: id,
        totalScore,
        finalRank: null,
        longestStreak: 0,
        isEliminated: false,
        eliminatedAtQuestion: null,
    });
    const question = (id: string, orderIndex: number, isAsked = true) => ({
        id,
        orderIndex,
        isAsked,
        question: id,
        options: ['Yes', 'No'],
        correctAnswer: 0,
    });
    const response = (participantId: string, questionId: string, isCorrect: boolean) => ({
        participantId,
        questionId,
        isCorrect,
        selectedAnswer: isCorrect ? 0 : 1,
        timeToAnswer: 2000,
        pointsEarned: isCorrect ? 100 : 0,
        answeredAt: new Date('2026-01-01T00:02:00Z'),
    });
    return {
        id: 'quiz',
        title: 'Report quiz',
        startedAt: new Date('2026-01-01T00:00:00Z'),
        endedAt: new Date('2026-01-01T00:03:00Z'),
        prizePool: 10,
        currency: 'USDC',
        GameSession: {
            id: 'session',
            createdAt: new Date('2026-01-01T00:00:00Z'),
            currentPhase: 'QUIZ_RESULTS',
            phaseStartTime: new Date('2026-01-01T00:01:00Z'),
            responses: [
                response('Alice', 'q1', true),
                response('Alice', 'q2', true),
                response('Bob', 'q1', false),
                response('kicked', 'q1', true),
            ],
            lifelineUsage: [{ participantId: 'Alice' }],
            eliminations: [{ participantId: 'Bob', questionIndex: 0 }],
        },
        questions: [
            question('q1', 0),
            question('q2', 1),
            question('q3', 2),
            question('unasked', 3, false),
        ],
        participants: [
            player('Bob', 0),
            player('Alice', 200),
            player('Carol', 0),
            player('Dan', 0),
        ],
        prizeClaims: [{ participantId: 'Alice', rank: 1, amount: 10, status: 'PENDING' }],
    };
}

describe('session report calculations', () => {
    it('excludes kicked responses and computes participation, distributions, timing and player details', () => {
        const report = build_session_report(fixture(), true);
        expect(report.summary).toMatchObject({
            joined: 4,
            answered: 2,
            finished: 0,
            averageScore: 50,
            durationMs: 180000,
            durationEstimated: false,
        });
        expect(report.summary.accuracy).toBeCloseTo(200 / 3);
        expect(report.questions).toHaveLength(3);
        expect(report.questions[0]).toMatchObject({
            answered: 2,
            correct: 1,
            accuracy: 25,
            averageAnswerMs: 2000,
        });
        expect(report.questions[0]?.options.map((o) => o.count)).toEqual([1, 1]);
        expect(report.questions[2]).toMatchObject({
            answered: 0,
            averageAnswerMs: null,
            hardest: false,
            easiest: false,
        });
        expect(report.players[0]).toMatchObject({
            name: 'Alice',
            rank: 1,
            longestStreak: 2,
            usedLifeline: true,
            correct: 2,
        });
        expect(report.players.find((p) => p.name === 'Bob')).toMatchObject({
            eliminated: true,
            eliminatedOn: 1,
        });
        expect(report.players[0]?.answers).toHaveLength(2);
        expect(report.players.slice(1).map((p) => p.rank)).toEqual([2, 2, 2]);
        expect(report.summary.prizes[0]).toMatchObject({ name: 'Alice', amount: 10 });
    });

    it('handles historical timestamps, missing asked flags and empty sessions without NaN', () => {
        const quiz = fixture();
        quiz.endedAt = null;
        Object.assign(quiz.questions[1] ?? {}, { isAsked: false });
        const report = build_session_report(quiz, true);
        expect(report.summary.durationMs).toBe(120000);
        expect(report.summary.durationEstimated).toBe(true);
        expect(report.questions).toHaveLength(3);
        quiz.participants = [];
        quiz.GameSession.responses = [];
        quiz.GameSession.phaseStartTime = null;
        const empty = build_session_report(quiz, true);
        expect(empty.summary).toMatchObject({
            joined: 0,
            answered: 0,
            finished: 0,
            accuracy: 0,
            averageScore: 0,
            durationMs: null,
        });
        expect(JSON.stringify(empty)).not.toContain('NaN');
    });

    it('marks easiest/hardest questions and counts last-question answers', () => {
        const quiz = fixture();
        quiz.questions = quiz.questions.slice(0, 2);
        Object.assign(quiz.GameSession.responses[1] ?? {}, { isCorrect: false });
        const report = build_session_report(quiz, true);
        expect(report.questions[0]).toMatchObject({ easiest: true, hardest: false });
        expect(report.questions[1]).toMatchObject({ easiest: false, hardest: true });
        expect(report.summary.finished).toBe(1);
    });

    it('redacts questions, answers and all but three players for Free hosts', () => {
        const report = build_session_report(fixture(), false);
        expect(report.questions).toEqual([]);
        expect(report.players).toHaveLength(3);
        expect(report.players.every((p) => p.answers.length === 0)).toBe(true);
        expect(report.summary.joined).toBe(4);
    });

    it('escapes CSV quotes, newlines, commas and spreadsheet formulas', () => {
        expect(csv([['=HYPERLINK("bad")', 'a,b\nc', '  +cmd', '@cmd', 1, null]])).toBe(
            '\uFEFF"\'=HYPERLINK(""bad"")","a,b\nc","\'  +cmd","\'@cmd","1",""',
        );
    });
});

describe('session report HTTP access', () => {
    beforeEach(() => vi.clearAllMocks());

    function mockReport(premium: boolean) {
        vi.mocked(prisma.quiz.findUnique).mockResolvedValueOnce({
            ...fixture(),
            host: { subscriptions: premium ? [{ tier: { name: 'PRO' } }] : [] },
        } as never);
    }

    it('requires authentication', async () => {
        expect((await request(app).get('/api/v1/quiz/session-report/quiz')).status).toBe(401);
        expect(prisma.quiz.findUnique).not.toHaveBeenCalled();
    });

    it('scopes reports to hosts or unblocked collaborators and ended sessions', async () => {
        vi.mocked(prisma.quiz.findUnique).mockResolvedValueOnce(null);
        const response = await request(app)
            .get('/api/v1/quiz/session-report/quiz')
            .set('Authorization', bearerHeader());
        expect(response.status).toBe(404);
        const where = vi.mocked(prisma.quiz.findUnique).mock.calls[0]?.[0]?.where;
        expect(where).toMatchObject({
            id: 'quiz',
            AND: [
                {
                    OR: [
                        { hostId: TEST_USER.id },
                        {
                            CollabSession: {
                                collaborators: { some: { userId: TEST_USER.id, isBlocked: false } },
                            },
                        },
                    ],
                },
                { GameSession: { isNot: null } },
            ],
        });
    });

    it('uses the host subscription and enforces Free limits on the server', async () => {
        mockReport(false);
        const response = await request(app)
            .get('/api/v1/quiz/session-report/quiz')
            .set('Authorization', bearerHeader());
        expect(response.status).toBe(200);
        expect(response.body.data.fullAccess).toBe(false);
        expect(response.body.data.players).toHaveLength(3);
        expect(response.body.data.questions).toEqual([]);
        expect(vi.mocked(prisma.quiz.findUnique).mock.calls[0]?.[0]?.select).toMatchObject({
            host: {
                select: {
                    subscriptions: {
                        where: {
                            status: { in: ['ACTIVE', 'TRIALING'] },
                            currentPeriodEnd: { gt: expect.any(Date) },
                        },
                    },
                },
            },
            participants: { where: { isKicked: false } },
        });
    });

    it('forbids Free CSV requests and exports Premium CSV', async () => {
        mockReport(false);
        const free = await request(app)
            .get('/api/v1/quiz/session-report/quiz?format=players')
            .set('Authorization', bearerHeader());
        expect(free.status).toBe(403);
        mockReport(true);
        const premium = await request(app)
            .get('/api/v1/quiz/session-report/quiz?format=questions')
            .set('Authorization', bearerHeader());
        expect(premium.status).toBe(200);
        expect(premium.headers['content-type']).toContain('text/csv');
        expect(premium.text).toContain('Option text');
        expect(premium.text).toContain('Yes');
        expect(premium.text).not.toContain('claimToken');
    });

    it('validates history pagination and export format before querying', async () => {
        expect(
            (
                await request(app)
                    .get('/api/v1/quiz/sessions?page=-1')
                    .set('Authorization', bearerHeader())
            ).status,
        ).toBe(400);
        expect(
            (
                await request(app)
                    .get('/api/v1/quiz/session-report/quiz?format=secret')
                    .set('Authorization', bearerHeader())
            ).status,
        ).toBe(400);
        expect(prisma.quiz.findMany).not.toHaveBeenCalled();
        expect(prisma.quiz.findUnique).not.toHaveBeenCalled();
    });

    it('lists historical sessions newest first, with eligible counts and winners', async () => {
        vi.mocked(prisma.quiz.findMany).mockResolvedValueOnce([
            {
                id: 'quiz',
                title: 'Old quiz',
                startedAt: null,
                GameSession: { id: 'session', createdAt: new Date('2026-01-01') },
                _count: { participants: 4 },
                participants: [{ nickname: 'Alice' }],
            },
        ] as never);
        const response = await request(app)
            .get('/api/v1/quiz/sessions')
            .set('Authorization', bearerHeader());
        expect(response.status).toBe(200);
        expect(response.body.data).toMatchObject({
            hasMore: false,
            sessions: [{ joined: 4, winner: 'Alice', date: '2026-01-01T00:00:00.000Z' }],
        });
        expect(vi.mocked(prisma.quiz.findMany).mock.calls[0]?.[0]).toMatchObject({
            orderBy: [{ GameSession: { createdAt: 'desc' } }, { id: 'desc' }],
            take: 21,
            skip: 0,
        });
    });
});
