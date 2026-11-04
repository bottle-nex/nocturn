'use client';
import { useState } from 'react';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { SubmittedAnswer, formatAnswer } from '@nocturn/types';

export default function ParticipantQuestionActiveOptions() {
    const { currentQuestion } = useLiveQuizStore();
    return currentQuestion ? <AnswerInput key={currentQuestion.id} /> : null;
}

function AnswerInput() {
    const {
        currentQuestion: q,
        setAlreadyResponded,
        lifelineResult,
        lifelineLiveVotes,
    } = useLiveQuizStore();
    const { response, setResponse } = useLiveParticipantsStore();
    const { participantData } = useLiveParticipantStore();
    const { handleParticipantResponseMessage } = useWebSocket();
    const [draft, setDraft] = useState<SubmittedAnswer>(() =>
        q?.questionType === 'ORDERING'
            ? (q.options ?? []).map((_, i) => i)
            : q?.questionType === 'MULTI_SELECT'
              ? []
              : q?.questionType === 'NUMERIC'
                ? (q.answerConfig?.min ?? 0)
                : '',
    );
    const [dragged, setDragged] = useState<number | null>(null);
    if (!q) return null;
    const type = q.questionType ?? 'MULTIPLE_CHOICE';
    const saved = response?.questionId === q.id ? response : null;
    const locked = !!saved;
    const value = saved?.answer ?? saved?.selectedAnswer ?? draft;
    const votes = lifelineResult?.optionBreakdown ?? lifelineLiveVotes;
    function submit(answer: SubmittedAnswer) {
        if (!q || locked) return;
        setAlreadyResponded(true);
        setResponse({
            participantId: participantData?.id,
            questionId: q.id,
            answer,
            selectedAnswer: typeof answer === 'number' ? answer : -1,
        });
        handleParticipantResponseMessage({ answer, questionId: q.id });
    }
    function move(from: number, to: number) {
        if (!Array.isArray(draft) || locked || to < 0 || to >= draft.length) return;
        const order = [...draft];
        const item = order.splice(from, 1)[0];
        if (item === undefined) return;
        order.splice(to, 0, item);
        setDraft(order);
    }
    return (
        <div className="w-full flex flex-col gap-3 overflow-y-auto p-2">
            {locked && <p role="status">Answer submitted: {formatAnswer(q, value)}</p>}
            {type === 'SHORT_ANSWER' ? (
                <label>
                    Your answer
                    <input
                        className="w-full rounded border p-3 bg-white text-black"
                        maxLength={200}
                        value={String(value)}
                        disabled={locked}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && String(draft).trim()) submit(draft);
                        }}
                    />
                </label>
            ) : type === 'NUMERIC' ? (
                <label>
                    Your guess: {String(value)}
                    <input
                        className="w-full"
                        type="range"
                        min={q.answerConfig?.min}
                        max={q.answerConfig?.max}
                        step="any"
                        value={Number(value)}
                        disabled={locked}
                        onChange={(e) => setDraft(Number(e.target.value))}
                    />
                    <input
                        aria-label="Exact numeric guess"
                        className="w-full rounded border p-2 bg-white text-black"
                        type="number"
                        step="any"
                        min={q.answerConfig?.min}
                        max={q.answerConfig?.max}
                        value={Number(value)}
                        disabled={locked}
                        onChange={(e) => setDraft(Number(e.target.value))}
                    />
                    <span>
                        {q.answerConfig?.min} – {q.answerConfig?.max}
                    </span>
                </label>
            ) : type === 'ORDERING' ? (
                <>
                    <p>Drag items into order, or use the arrow buttons.</p>
                    {(Array.isArray(value) ? value : []).map((item, position) => (
                        <div
                            key={item}
                            draggable={!locked}
                            onDragStart={() => setDragged(position)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                                if (dragged !== null) move(dragged, position);
                                setDragged(null);
                            }}
                            className="flex items-center gap-3 rounded border bg-white text-black p-3"
                        >
                            <span>
                                {position + 1}. {q.options[item]}
                            </span>
                            <button
                                aria-label={`Move ${q.options[item]} up`}
                                disabled={locked || position === 0}
                                onClick={() => move(position, position - 1)}
                            >
                                ↑
                            </button>
                            <button
                                aria-label={`Move ${q.options[item]} down`}
                                disabled={locked || position === q.options.length - 1}
                                onClick={() => move(position, position + 1)}
                            >
                                ↓
                            </button>
                        </div>
                    ))}
                </>
            ) : (
                <>
                    {type === 'MULTI_SELECT' && <p>Choose every correct answer, then submit.</p>}
                    {(q.options ?? []).map((option, i) => (
                        <button
                            key={i}
                            disabled={locked}
                            aria-pressed={Array.isArray(value) ? value.includes(i) : value === i}
                            className="rounded border p-4 bg-white text-black aria-pressed:bg-teal-200 text-left"
                            onClick={() => {
                                if (type === 'MULTI_SELECT')
                                    setDraft(
                                        Array.isArray(draft) && draft.includes(i)
                                            ? draft.filter((v) => v !== i)
                                            : [...(Array.isArray(draft) ? draft : []), i],
                                    );
                                else submit(i);
                            }}
                        >
                            {option}
                            {(votes?.[i] ?? 0) > 0 && <span> · {votes[i]} spectator votes</span>}
                        </button>
                    ))}
                </>
            )}
            {!['MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(type) && (
                <button
                    className="rounded bg-teal-700 text-white p-3 disabled:opacity-50"
                    disabled={
                        locked ||
                        (type === 'SHORT_ANSWER' && !String(draft).trim()) ||
                        (type === 'MULTI_SELECT' && Array.isArray(draft) && !draft.length) ||
                        (type === 'NUMERIC' &&
                            (typeof draft !== 'number' ||
                                !Number.isFinite(draft) ||
                                draft < (q.answerConfig?.min ?? 0) ||
                                draft > (q.answerConfig?.max ?? 100)))
                    }
                    onClick={() => submit(draft)}
                >
                    Submit answer
                </button>
            )}
        </div>
    );
}
