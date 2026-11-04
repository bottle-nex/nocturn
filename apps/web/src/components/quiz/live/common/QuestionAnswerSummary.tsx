'use client';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { correctAnswerLabel, formatAnswer, getAnswerConfig, normalizeAnswer } from '@nocturn/types';

export default function QuestionAnswerSummary() {
    const { currentQuestion: q } = useLiveQuizStore();
    const { responses, response } = useLiveParticipantsStore();
    if (!q) return null;
    const config = getAnswerConfig(q);
    const answers = responses
        .map((r) => r.answer ?? r.selectedAnswer)
        .filter((a) => a !== undefined);
    const counts = new Map<string, number>();
    for (const answer of answers) {
        if (q.questionType === 'MULTI_SELECT' && Array.isArray(answer)) {
            for (const i of answer) {
                const label = q.options[i] ?? '';
                counts.set(label, (counts.get(label) ?? 0) + 1);
            }
        } else {
            const label =
                q.questionType === 'SHORT_ANSWER'
                    ? normalizeAnswer(String(answer))
                    : formatAnswer(q, answer);
            counts.set(label, (counts.get(label) ?? 0) + 1);
        }
    }
    const own =
        response?.questionId === q.id
            ? (responses.find((r) => r.participantId === response.participantId) ?? response)
            : null;
    const distances =
        q.questionType === 'NUMERIC'
            ? answers
                  .filter((a): a is number => typeof a === 'number')
                  .map((a) => Math.abs(a - config.target!))
            : [];
    return (
        <section
            className="rounded border p-3 m-3 max-h-64 overflow-y-auto"
            aria-label="Question results"
        >
            <p>Correct answer: {correctAnswerLabel(q)}</p>
            {q.explanation && <p>{q.explanation}</p>}
            {own && (
                <p>
                    Your answer: {formatAnswer(q, own.answer ?? own.selectedAnswer)}
                    {own.pointsEarned !== undefined ? ` · ${own.pointsEarned} points` : ''}
                </p>
            )}
            <p>{answers.length} responses</p>
            {distances.length > 0 && (
                <p>
                    Average distance from the answer:{' '}
                    {(distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(2)}
                </p>
            )}
            {q.questionType === 'ORDERING' && (
                <ol>
                    {(config.correctOrder ?? []).map((item, position) => (
                        <li key={position}>
                            {position + 1}. {q.options[item]}:{' '}
                            {answers.filter((a) => Array.isArray(a) && a[position] === item).length}{' '}
                            in the correct position
                        </li>
                    ))}
                </ol>
            )}
            <ul>
                {[...counts]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([label, count]) => (
                        <li key={label}>
                            {label}: {count}
                        </li>
                    ))}
            </ul>
        </section>
    );
}
