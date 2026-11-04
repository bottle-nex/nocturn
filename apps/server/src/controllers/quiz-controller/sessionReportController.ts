import { prisma, Prisma } from '@nocturn/database';
import { FEATURE, planManager } from '@nocturn/premium';
import { SubscriptionEnum } from '@nocturn/types';
import type { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { build_session_report, csv } from '../../services/session-report';

const access = (userId: string): Prisma.QuizWhereInput => ({
    OR: [
        { hostId: userId },
        { CollabSession: { collaborators: { some: { userId, isBlocked: false } } } },
    ],
});

const finished: Prisma.QuizWhereInput = {
    GameSession: { isNot: null },
    OR: [
        { status: { in: ['COMPLETED', 'PAYOUT_PENDING', 'PAYOUT_COMPLETED', 'TIMED_OUT'] } },
        { GameSession: { currentPhase: 'QUIZ_RESULTS' } },
        { GameSession: { status: { in: ['COMPLETED', 'TIMED_OUT'] } } },
    ],
};

export async function sessionHistory(req: Request, res: Response) {
    if (!req.user?.id) return ResponseWriter.not_authorized(res);
    const page = Number(req.query.page ?? 0);
    if (!Number.isSafeInteger(page) || page < 0 || page > 100000) {
        return ResponseWriter.error(res, 'INVALID_PAGE', 'Invalid page', undefined, 400);
    }
    try {
        const quizzes = await prisma.quiz.findMany({
            where: { AND: [access(req.user.id), finished] },
            orderBy: [{ GameSession: { createdAt: 'desc' } }, { id: 'desc' }],
            skip: page * 20,
            take: 21,
            select: {
                id: true,
                title: true,
                startedAt: true,
                GameSession: { select: { id: true, createdAt: true } },
                _count: { select: { participants: { where: { isKicked: false } } } },
                participants: {
                    where: { isKicked: false },
                    orderBy: [{ totalScore: 'desc' }, { id: 'asc' }],
                    take: 1,
                    select: { nickname: true },
                },
            },
        });
        ResponseWriter.success(res, {
            sessions: quizzes.slice(0, 20).flatMap((q) =>
                q.GameSession
                    ? [
                          {
                              quizId: q.id,
                              sessionId: q.GameSession.id,
                              title: q.title,
                              date: (q.startedAt ?? q.GameSession.createdAt).toISOString(),
                              joined: q._count.participants,
                              winner: q.participants[0]?.nickname ?? null,
                          },
                      ]
                    : [],
            ),
            hasMore: quizzes.length > 20,
        });
    } catch (error) {
        console.error('Session history failed:', error);
        ResponseWriter.system_error(res);
    }
}

export async function sessionReport(req: Request, res: Response) {
    if (!req.user?.id) return ResponseWriter.not_authorized(res);
    const quizId = req.params.quizId;
    if (typeof quizId !== 'string' || !quizId) {
        return ResponseWriter.error(res, 'INVALID_QUIZ', 'Invalid quiz', undefined, 400);
    }
    const format = req.query.format;
    if (format !== undefined && format !== 'players' && format !== 'questions') {
        return ResponseWriter.error(res, 'INVALID_FORMAT', 'Invalid export format', undefined, 400);
    }
    try {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId, AND: [access(req.user.id), finished] },
            select: {
                id: true,
                title: true,
                startedAt: true,
                endedAt: true,
                prizePool: true,
                currency: true,
                host: {
                    select: {
                        subscriptions: {
                            where: {
                                status: { in: ['ACTIVE', 'TRIALING'] },
                                currentPeriodEnd: { gt: new Date() },
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            select: { tier: { select: { name: true } } },
                        },
                    },
                },
                GameSession: {
                    select: {
                        id: true,
                        createdAt: true,
                        currentPhase: true,
                        phaseStartTime: true,
                        responses: {
                            where: { participant: { isKicked: false } },
                            select: {
                                participantId: true,
                                questionId: true,
                                selectedAnswer: true,
                                isCorrect: true,
                                timeToAnswer: true,
                                pointsEarned: true,
                                answeredAt: true,
                            },
                        },
                        lifelineUsage: { select: { participantId: true } },
                        eliminations: { select: { participantId: true, questionIndex: true } },
                    },
                },
                participants: {
                    where: { isKicked: false },
                    select: {
                        id: true,
                        nickname: true,
                        totalScore: true,
                        finalRank: true,
                        longestStreak: true,
                        isEliminated: true,
                        eliminatedAtQuestion: true,
                    },
                },
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        question: true,
                        options: true,
                        correctAnswer: true,
                        orderIndex: true,
                        isAsked: true,
                    },
                },
                prizeClaims: {
                    orderBy: { rank: 'asc' },
                    select: { participantId: true, rank: true, amount: true, status: true },
                },
            },
        });
        if (!quiz?.GameSession) {
            return ResponseWriter.error(res, 'NOT_FOUND', 'Report not found', undefined, 404);
        }
        const tier =
            quiz.host.subscriptions[0]?.tier.name === SubscriptionEnum.PRO
                ? SubscriptionEnum.PRO
                : SubscriptionEnum.FREE;
        const fullAccess = planManager.isEnabled(tier, FEATURE.SESSION_INSIGHTS);
        if (format && !fullAccess) {
            return ResponseWriter.error(
                res,
                'PREMIUM_REQUIRED',
                'Premium is required to export reports',
                undefined,
                403,
            );
        }
        const report = build_session_report(quiz, fullAccess);
        // Reports contain private player data and can change as queued writes settle.
        res.setHeader('Cache-Control', 'private, no-store');
        if (format) {
            const rows =
                format === 'players'
                    ? [
                          [
                              'Rank',
                              'Name',
                              'Score',
                              'Correct',
                              'Answered',
                              'Accuracy (%)',
                              'Longest streak',
                              'Used lifeline',
                              'Eliminated',
                              'Eliminated on question',
                          ],
                          ...report.players.map((p) => [
                              p.rank,
                              p.name,
                              p.score,
                              p.correct,
                              p.answered,
                              p.accuracy,
                              p.longestStreak,
                              p.usedLifeline,
                              p.eliminated,
                              p.eliminatedOn,
                          ]),
                      ]
                    : [
                          [
                              'Question number',
                              'Question',
                              'Answered',
                              'Correct',
                              'Players correct (%)',
                              'Average answer (seconds)',
                              'Hardest',
                              'Easiest',
                              'Option',
                              'Option text',
                              'Selected',
                              'Correct option',
                          ],
                          ...report.questions.flatMap((q) =>
                              q.options.map((o, i) => [
                                  q.number,
                                  q.question,
                                  q.answered,
                                  q.correct,
                                  q.accuracy,
                                  q.averageAnswerMs === null ? null : q.averageAnswerMs / 1000,
                                  q.hardest,
                                  q.easiest,
                                  i + 1,
                                  o.label,
                                  o.count,
                                  i === q.correctAnswer,
                              ]),
                          ),
                      ];
            res.setHeader('Content-Disposition', `attachment; filename="session-${format}.csv"`);
            res.type('text/csv').send(csv(rows));
            return;
        }
        ResponseWriter.success(res, report);
    } catch (error) {
        console.error('Session report failed:', error);
        ResponseWriter.system_error(res);
    }
}
