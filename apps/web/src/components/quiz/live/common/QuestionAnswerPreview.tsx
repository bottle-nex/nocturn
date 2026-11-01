'use client';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';

export default function QuestionAnswerPreview() {
    const { currentQuestion: q } = useLiveQuizStore();
    if (!q) return null;
    if (q.questionType === 'SHORT_ANSWER') return <p>Players type a short answer.</p>;
    if (q.questionType === 'NUMERIC')
        return (
            <p>
                Players guess a number from {q.answerConfig?.min} to {q.answerConfig?.max}.
            </p>
        );
    if (q.questionType === 'MULTI_SELECT') return <p>Players select every answer that applies.</p>;
    if (q.questionType === 'ORDERING') return <p>Players arrange these items in order.</p>;
    return null;
}
