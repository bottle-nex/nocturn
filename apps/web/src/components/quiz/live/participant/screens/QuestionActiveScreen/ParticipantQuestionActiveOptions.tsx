import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { cn } from '@/lib/utils';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { QuizPhaseEnum } from '@nocturn/types';

type Hex = `#${string}`;

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

function hexToRgb(hex: string) {
    const h = hex.replace('#', '');
    const full =
        h.length === 3
            ? h
                  .split('')
                  .map((c) => c + c)
                  .join('')
            : h;
    return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
    };
}

function isColorLight(r: number, g: number, b: number) {
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export default function ParticipantQuestionActiveOptions() {
    const {
        currentQuestion,
        quiz: liveQuiz,
        gameSession,
        alreadyResponded,
        setAlreadyResponded,
        lifelineRequested,
        lifelineResult,
        hasUsedLifeline,
        lifelineLiveVotes,
    } = useLiveQuizStore();

    const { handleParticipantResponseMessage, handleParticipantRequestLifeline } = useWebSocket();
    const [selected, setSelected] = useState<number | null>(null);
    const { setResponse } = useLiveParticipantsStore();
    const { participantData } = useLiveParticipantStore();

    useEffect(() => {
        setSelected(null);
        setAlreadyResponded(false);
    }, [currentQuestion?.id, setAlreadyResponded]);

    if (!currentQuestion) return null;

    const barColors = liveQuiz.template?.bars ?? (['#ffffff'] as Hex[]);

    const canRequestLifeline =
        gameSession?.currentPhase === QuizPhaseEnum.QUESTION_ACTIVE &&
        !hasUsedLifeline &&
        !alreadyResponded &&
        !lifelineRequested;

    const getBarData = () => {
        if (lifelineResult) return lifelineResult.optionBreakdown;
        if (lifelineRequested && lifelineLiveVotes.length > 0) return lifelineLiveVotes;
        return null;
    };

    const barData = getBarData();
    const totalVotes = barData ? barData.reduce((a, b) => a + b, 0) : 0;
    const shouldShowBars = (lifelineRequested || lifelineResult) && !hasUsedLifeline;

    function handleSelectOption(index: number) {
        if (selected !== null || alreadyResponded) return;
        setSelected(index);
        setAlreadyResponded(true);
        setResponse({
            participantId: participantData?.id,
            selectedAnswer: index,
            questionId: currentQuestion?.id,
        });
        handleParticipantResponseMessage({ selectedAnswer: index });
    }

    function handleRequestLifeline() {
        if (!canRequestLifeline || !currentQuestion) return;
        handleParticipantRequestLifeline({ questionId: currentQuestion.id });
    }

    const getVotePercentage = (idx: number): number => {
        if (!barData || totalVotes === 0) return 0;
        return Math.round(((barData[idx] || 0) / totalVotes) * 100);
    };

    const options = currentQuestion.options;
    const cells: (string | null)[] = [...options];
    if (cells.length % 2 !== 0) cells.push(null);

    return (
        <>
            {shouldShowBars && barData && (
                <div
                    className="fixed top-5 right-5 z-50 w-48 rounded-2xl p-4 space-y-3"
                    style={{
                        background: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                    }}
                >
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-white/50">
                        Spectator Votes
                    </p>
                    {barData.map((_: number, idx: number) => {
                        const color = barColors[idx % barColors.length] as Hex;
                        const pct = getVotePercentage(idx);
                        return (
                            <div key={idx} className="flex items-center gap-2.5">
                                <span className="font-mono text-xs w-3 shrink-0 font-medium text-white/50">
                                    {LABELS[idx]}
                                </span>
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, backgroundColor: color }}
                                    />
                                </div>
                                <span className="font-mono text-xs w-7 text-right shrink-0 font-bold text-white">
                                    {pct}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="w-full flex flex-col items-center gap-6 px-6 py-6">
                <div className="w-full grid grid-cols-2 gap-4">
                    {cells.map((option, idx) => {
                        if (option === null) return <div key={idx} />;

                        const color = barColors[idx % barColors.length] as Hex;
                        const isSelected = selected === idx;
                        const isDisabled = selected !== null && !isSelected;
                        const isLifelineSuggestion =
                            lifelineResult?.wasSuccessful &&
                            lifelineResult.mostPopularOption === idx;
                        const pct = getVotePercentage(idx);
                        const label = LABELS[idx] ?? String(idx + 1);
                        const { r, g, b } = hexToRgb(color);

                        return (
                            <button
                                key={idx}
                                onClick={() => !isDisabled && handleSelectOption(idx)}
                                disabled={isDisabled}
                                className={cn(
                                    'group relative text-left rounded-2xl overflow-hidden',
                                    'transition-all duration-200 focus:outline-none',
                                    !isDisabled &&
                                        !isSelected &&
                                        'hover:brightness-125 active:scale-[0.98]',
                                )}
                                style={{
                                    background: isSelected
                                        ? `rgba(${r},${g},${b},0.35)`
                                        : 'rgba(0,0,0,0.32)',
                                    backdropFilter: 'blur(20px)',
                                    border: isSelected
                                        ? `2px solid rgba(${r},${g},${b},0.85)`
                                        : isLifelineSuggestion
                                          ? '2px solid rgba(52,211,153,0.9)'
                                          : '1px solid rgba(255,255,255,0.18)',
                                    cursor: isDisabled ? 'default' : 'pointer',
                                    opacity: isDisabled ? 0.55 : 1,
                                }}
                            >
                                {barData && pct > 0 && (
                                    <div
                                        className="absolute inset-y-0 left-0 pointer-events-none transition-all duration-700"
                                        style={{
                                            width: `${pct}%`,
                                            background: `rgba(${r},${g},${b},0.2)`,
                                        }}
                                    />
                                )}

                                <div className="relative flex items-center gap-3 px-5 py-4">
                                    <span
                                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-mono"
                                        style={{
                                            background: isSelected
                                                ? `rgba(${r},${g},${b},1)`
                                                : 'rgba(255,255,255,0.18)',
                                            color:
                                                isSelected && isColorLight(r, g, b)
                                                    ? '#000'
                                                    : '#fff',
                                            boxShadow: isSelected
                                                ? `inset 0 0 0 1.5px rgba(0,0,0,0.25)`
                                                : 'none',
                                        }}
                                    >
                                        {label}
                                    </span>

                                    <span className="flex-1 text-lg font-semibold leading-tight text-white">
                                        {option}
                                    </span>

                                    {(isLifelineSuggestion || (barData && pct > 0)) && (
                                        <div className="shrink-0 flex items-center gap-1.5">
                                            {isLifelineSuggestion && !hasUsedLifeline && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                                    Pick
                                                </span>
                                            )}
                                            {barData && pct > 0 && (
                                                <span className="text-sm font-mono font-bold text-white/80">
                                                    {pct}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleRequestLifeline}
                    disabled={!canRequestLifeline}
                    className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold',
                        'transition-all duration-150 focus:outline-none',
                        canRequestLifeline
                            ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]'
                            : 'cursor-not-allowed opacity-40',
                    )}
                    style={{
                        background: 'rgba(255,255,255,0.95)',
                        color: 'rgba(0,0,0,0.7)',
                        border: 'none',
                    }}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={lifelineRequested ? 'animate-pulse' : ''}
                    >
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
                        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
                        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" />
                        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
                    </svg>
                    {hasUsedLifeline
                        ? 'Lifeline used'
                        : lifelineRequested
                          ? 'Waiting for spectators…'
                          : 'Ask spectators'}
                </button>
            </div>
        </>
    );
}
