import type { SessionReport } from '@nocturn/types';

// Deliberately accepts only report data: no emails, wallets or prize claim tokens.
export interface ReportSource {
    id: string;
    title: string;
    startedAt: Date | null;
    endedAt: Date | null;
    prizePool: number;
    currency: string;
    GameSession: {
        id: string;
        createdAt: Date;
        currentPhase: string | null;
        phaseStartTime: Date | null;
        responses: {
            participantId: string;
            questionId: string;
            selectedAnswer: number;
            isCorrect: boolean;
            timeToAnswer: number;
            pointsEarned: number;
            answeredAt: Date;
        }[];
        lifelineUsage: { participantId: string }[];
        eliminations: { participantId: string; questionIndex: number }[];
    } | null;
    questions: {
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        orderIndex: number;
        isAsked: boolean;
    }[];
    participants: {
        id: string;
        nickname: string;
        totalScore: number;
        finalRank: number | null;
        longestStreak: number;
        isEliminated: boolean;
        eliminatedAtQuestion: string | null;
    }[];
    prizeClaims: { participantId: string; rank: number; amount: number; status: string }[];
}

const percentage = (part: number, total: number) => (total ? (part / total) * 100 : 0);

export function build_session_report(quiz: ReportSource, fullAccess: boolean): SessionReport {
    const session = quiz.GameSession;
    if (!session) throw new Error('Session required');
    // The query excludes kicked players; ignore their responses in every aggregate too.
    const eligible = new Set(quiz.participants.map((p) => p.id));
    const responses = session.responses.filter((r) => eligible.has(r.participantId));
    const byQuestion = new Map<string, typeof responses>();
    const byPlayer = new Map<string, typeof responses>();
    for (const response of responses) {
        const questionRows = byQuestion.get(response.questionId) ?? [];
        questionRows.push(response);
        byQuestion.set(response.questionId, questionRows);
        const playerRows = byPlayer.get(response.participantId) ?? [];
        playerRows.push(response);
        byPlayer.set(response.participantId, playerRows);
    }
    const asked = quiz.questions
        .filter((q) => q.isAsked || byQuestion.has(q.id))
        .sort((a, b) => a.orderIndex - b.orderIndex);
    const questions = asked.map((q, index) => {
        const rows = byQuestion.get(q.id) ?? [];
        const correct = rows.filter((r) => r.isCorrect).length;
        return {
            id: q.id,
            number: index + 1,
            question: q.question,
            correctAnswer: q.correctAnswer,
            answered: rows.length,
            correct,
            accuracy: percentage(correct, quiz.participants.length),
            averageAnswerMs: rows.length
                ? rows.reduce((sum, r) => sum + r.timeToAnswer, 0) / rows.length
                : null,
            hardest: false,
            easiest: false,
            options: q.options.map((label, option) => ({
                label,
                count: rows.filter((r) => r.selectedAnswer === option).length,
            })),
        };
    });
    const answeredQuestions = questions.filter((q) => q.answered > 0);
    const min = Math.min(...answeredQuestions.map((q) => q.accuracy));
    const max = Math.max(...answeredQuestions.map((q) => q.accuracy));
    for (const q of answeredQuestions) {
        q.hardest = q.accuracy === min;
        q.easiest = q.accuracy === max;
    }
    const lifelines = new Set(session.lifelineUsage.map((l) => l.participantId));
    const eliminated = new Map(session.eliminations.map((e) => [e.participantId, e.questionIndex]));
    const orderedPlayers = [...quiz.participants].sort(
        (a, b) => b.totalScore - a.totalScore || a.id.localeCompare(b.id),
    );
    let rank = 1;
    const players = orderedPlayers.map((p, index) => {
        const previousScore = orderedPlayers[index - 1]?.totalScore;
        if (previousScore !== undefined && p.totalScore < previousScore) rank = index + 1;
        const rows = byPlayer.get(p.id) ?? [];
        const correct = rows.filter((r) => r.isCorrect).length;
        let streak = 0;
        let longestStreak = p.longestStreak;
        const answersByQuestion = new Map(rows.map((r) => [r.questionId, r]));
        for (const q of asked) {
            streak = answersByQuestion.get(q.id)?.isCorrect ? streak + 1 : 0;
            longestStreak = Math.max(longestStreak, streak);
        }
        const eliminationQuestion = quiz.questions.find((q) => q.id === p.eliminatedAtQuestion);
        const eliminationIndex = eliminated.get(p.id);
        return {
            id: p.id,
            name: p.nickname,
            rank: p.finalRank ?? rank,
            score: p.totalScore,
            correct,
            answered: rows.length,
            accuracy: percentage(correct, rows.length),
            longestStreak,
            usedLifeline: lifelines.has(p.id),
            eliminated: p.isEliminated || eliminationIndex !== undefined,
            eliminatedOn: eliminationQuestion
                ? eliminationQuestion.orderIndex + 1
                : eliminationIndex !== undefined
                  ? eliminationIndex + 1
                  : null,
            answers: rows.map((r) => ({
                questionId: r.questionId,
                selectedAnswer: r.selectedAnswer,
                correct: r.isCorrect,
                timeMs: r.timeToAnswer,
                points: r.pointsEarned,
            })),
        };
    });
    players.sort((a, b) => a.rank - b.rank || b.score - a.score);
    const lastQuestion = asked[asked.length - 1];
    const start = quiz.startedAt ?? session.createdAt;
    // updatedAt can change during payouts/expiry, so it is never a duration fallback.
    const lastAnswer = responses.reduce<Date | null>(
        (latest, r) => (!latest || r.answeredAt > latest ? r.answeredAt : latest),
        null,
    );
    const phaseEnd = session.currentPhase === 'QUIZ_RESULTS' ? session.phaseStartTime : null;
    const estimatedEnd =
        lastAnswer && phaseEnd
            ? new Date(Math.max(lastAnswer.getTime(), phaseEnd.getTime()))
            : (lastAnswer ?? phaseEnd);
    const end = quiz.endedAt ?? estimatedEnd;
    return {
        quizId: quiz.id,
        sessionId: session.id,
        title: quiz.title,
        date: start.toISOString(),
        fullAccess,
        summary: {
            joined: players.length,
            answered: byPlayer.size,
            finished: lastQuestion ? (byQuestion.get(lastQuestion.id)?.length ?? 0) : 0,
            averageScore: players.length
                ? players.reduce((sum, p) => sum + p.score, 0) / players.length
                : 0,
            accuracy: percentage(responses.filter((r) => r.isCorrect).length, responses.length),
            durationMs: end ? Math.max(0, end.getTime() - start.getTime()) : null,
            durationEstimated: !quiz.endedAt || !quiz.startedAt,
            prizePool: quiz.prizePool,
            currency: quiz.currency,
            prizes: quiz.prizeClaims
                .filter((c) => eligible.has(c.participantId))
                .map((c) => ({
                    name: quiz.participants.find((p) => p.id === c.participantId)?.nickname ?? '',
                    rank: c.rank,
                    amount: c.amount,
                    status: c.status,
                })),
        },
        questions: fullAccess ? questions : [],
        players: fullAccess ? players : players.slice(0, 3).map((p) => ({ ...p, answers: [] })),
    };
}

// Quote every field and neutralize spreadsheet formulas, including leading whitespace.
export function csv(rows: (string | number | boolean | null)[][]): string {
    return (
        '\uFEFF' +
        rows
            .map((row) =>
                row
                    .map((value) => {
                        let cell = value === null ? '' : String(value);
                        if (/^\s*[=+@-]/.test(cell)) cell = "'" + cell;
                        return '"' + cell.replace(/"/g, '""') + '"';
                    })
                    .join(','),
            )
            .join('\r\n')
    );
}
