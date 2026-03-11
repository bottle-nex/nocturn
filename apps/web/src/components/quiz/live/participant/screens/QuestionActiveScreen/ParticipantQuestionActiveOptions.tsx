import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const LABEL_COLORS = ['#6366f1', '#e11d48', '#0891b2', '#d97706', '#16a34a', '#9333ea'];

function getAccent(idx: number) {
    const hex = LABEL_COLORS[idx % LABEL_COLORS.length];
    return {
        label: hex,
        labelBg: `${hex}1a`,
        labelBgSelected: `${hex}33`,
        cardBg: `${hex}0f`,
        ring: `${hex}66`,
    };
}

export default function ParticipantQuestionActiveOptions() {
    const {
        currentQuestion,
        alreadyResponded,
        setAlreadyResponded,
        lifelineRequested,
        lifelineResult,
        hasUsedLifeline,
        lifelineLiveVotes,
    } = useLiveQuizStore();
    const { handleParticipantResponseMessage } = useWebSocket();
    const { setResponse } = useLiveParticipantsStore();
    const { participantData } = useLiveParticipantStore();
    const [selected, setSelected] = useState<number | null>(null);

    useEffect(() => {
        setSelected(null);
        setAlreadyResponded(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestion?.id]);

    if (!currentQuestion) return null;

    const barData =
        lifelineResult?.optionBreakdown ??
        (lifelineLiveVotes.length > 0 ? lifelineLiveVotes : null);

    const totalVotes = barData?.reduce((a, b) => a + b, 0) ?? 0;
    const getPct = (idx: number) =>
        barData && totalVotes > 0 ? Math.round(((barData[idx] ?? 0) / totalVotes) * 100) : 0;

    const showBars = (lifelineRequested || lifelineResult) && !hasUsedLifeline;

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

    const cells = [
        ...currentQuestion.options,
        ...(currentQuestion.options.length % 2 !== 0 ? [null] : []),
    ];

    return (
        <>
            {showBars && barData && (
                <div
                    className="fixed top-16 right-4 z-50 w-44 rounded-2xl p-4 space-y-2.5"
                    style={{
                        background: 'rgba(10,10,15,0.85)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }}
                >
                    <p
                        className="text-[9px] uppercase tracking-[0.2em] font-bold mb-3"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                        Spectator Votes
                    </p>
                    {barData.map((_: number, idx: number) => {
                        const { label } = getAccent(idx);
                        const pct = getPct(idx);
                        return (
                            <div key={idx} className="flex items-center gap-2">
                                <span
                                    className="font-mono text-[11px] w-3.5 shrink-0 font-bold"
                                    style={{ color: label }}
                                >
                                    {LABELS[idx]}
                                </span>
                                <div className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, background: label }}
                                    />
                                </div>
                                <span className="font-mono text-[11px] w-7 text-right shrink-0 font-bold text-white">
                                    {pct}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="w-full min-h-0 flex-1 overflow-y-auto flex flex-col gap-y-4 py-1 px-0.5">
                {cells.map((option, idx) => {
                    if (option === null) return <div key={idx} className="w-full" />;
                    const isSelected = selected === idx;
                    const isDisabled = selected !== null && !isSelected;
                    const isLifelineSuggestion =
                        lifelineResult?.wasSuccessful && lifelineResult.mostPopularOption === idx;
                    const pct = getPct(idx);
                    const { label, labelBg, labelBgSelected, cardBg, ring } = getAccent(idx);

                    return (
                        <div
                            key={idx}
                            onClick={() => !isDisabled && handleSelectOption(idx)}
                            className="w-full rounded-lg flex items-stretch overflow-hidden ring-1 ring-black/10 transition-all duration-150"
                            style={{
                                background: isSelected
                                    ? cardBg
                                    : isLifelineSuggestion && !hasUsedLifeline
                                      ? '#14b8a614'
                                      : '#ffffff',
                                border: `1px solid ${isSelected ? ring : isLifelineSuggestion && !hasUsedLifeline ? '#14b8a666' : 'transparent'}`,
                                opacity: 1,
                                cursor: isDisabled ? 'default' : 'pointer',
                            }}
                        >
                            <div
                                className="flex items-center justify-center shrink-0 transition-colors duration-150"
                                style={{
                                    minWidth: '3.25rem',
                                    background: isSelected ? labelBgSelected : labelBg,
                                    borderRight: `1px solid ${ring}30`,
                                }}
                            >
                                <span
                                    className="font-bold text-sm tracking-wide"
                                    style={{ color: label }}
                                >
                                    {LABELS[idx]}
                                </span>
                            </div>
                            <div className="flex-1 flex items-center px-4 py-4 gap-x-3 min-w-0">
                                <span
                                    className="flex-1 leading-snug text-sm sm:text-base text-dark-base"
                                    style={{ fontWeight: isSelected ? 500 : 400 }}
                                >
                                    {option}
                                </span>
                                <div className="flex items-center gap-x-2 shrink-0">
                                    {pct > 0 && (
                                        <span
                                            className="font-mono text-xs"
                                            style={{ color: label }}
                                        >
                                            {pct}%
                                        </span>
                                    )}
                                    {isLifelineSuggestion && !hasUsedLifeline && (
                                        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/30">
                                            Pick
                                        </span>
                                    )}
                                    {isSelected && (
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <circle
                                                cx="8"
                                                cy="8"
                                                r="7.5"
                                                stroke={label}
                                                strokeOpacity="0.6"
                                            />
                                            <path
                                                d="M4.5 8.5L6.5 10.5L11.5 5.5"
                                                stroke={label}
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
