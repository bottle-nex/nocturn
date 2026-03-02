import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { cn } from '@/lib/utils';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { QuizPhaseEnum } from '@nocturn/types';
import { Button } from '@/components/ui/button';
import { IoPeopleOutline } from 'react-icons/io5';

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

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
    const { setResponse } = useLiveParticipantsStore();
    const { participantData } = useLiveParticipantStore();
    const [selected, setSelected] = useState<number | null>(null);

    useEffect(() => {
        setSelected(null);
        setAlreadyResponded(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentQuestion?.id]);

    if (!currentQuestion) return null;

    const barColors = liveQuiz.template?.bars ?? ['#3b82f6'];
    const barData =
        lifelineResult?.optionBreakdown ??
        (lifelineLiveVotes.length > 0 ? lifelineLiveVotes : null);
    const totalVotes = barData?.reduce((a, b) => a + b, 0) ?? 0;
    const showBars = (lifelineRequested || lifelineResult) && !hasUsedLifeline;
    const canRequestLifeline =
        gameSession?.currentPhase === QuizPhaseEnum.QUESTION_ACTIVE &&
        !hasUsedLifeline &&
        !alreadyResponded &&
        !lifelineRequested;

    const getColor = (idx: number) => barColors[idx % barColors.length];
    const getPct = (idx: number) =>
        barData && totalVotes > 0 ? Math.round(((barData[idx] ?? 0) / totalVotes) * 100) : 0;

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

    const cells = [
        ...currentQuestion.options,
        ...(currentQuestion.options.length % 2 !== 0 ? [null] : []),
    ];

    return (
        <>
            {/* Spectator votes overlay */}
            {showBars && barData && (
                <div
                    className="fixed top-5 right-5 z-50 w-40 sm:w-48 rounded-2xl p-3 sm:p-4 space-y-3"
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
                        const color = getColor(idx);
                        const pct = getPct(idx);
                        return (
                            <div key={idx} className="flex items-center gap-2.5">
                                <span className="font-mono text-xs w-3 shrink-0 font-medium text-white/50">
                                    {LABELS[idx]}
                                </span>
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${pct}%`,
                                            background: `linear-gradient(to right, ${color}, ${color}40)`,
                                        }}
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

            {/* Scrollable options + button container */}
            <div className="w-full min-h-0 flex-1 overflow-y-auto flex flex-col items-center gap-y-3 sm:gap-y-4 py-2">
                {cells.map((option, idx) => {
                    if (option === null) return <div key={idx} className="w-full" />;
                    const isSelected = selected === idx;
                    const isDisabled = selected !== null && !isSelected;
                    const isLifelineSuggestion =
                        lifelineResult?.wasSuccessful && lifelineResult.mostPopularOption === idx;
                    const pct = getPct(idx);

                    return (
                        <div
                            key={idx}
                            onClick={() => !isDisabled && handleSelectOption(idx)}
                            className={cn(
                                'w-full max-w-2xl shrink-0 min-h-14 sm:min-h-16 ring-1 rounded-xl flex text-dark-base items-center overflow-hidden transition-all duration-150',
                                isDisabled ? 'opacity-50 cursor-default' : 'cursor-pointer',
                                isSelected
                                    ? 'ring-blue-400 bg-blue-50'
                                    : isLifelineSuggestion && !hasUsedLifeline
                                      ? 'ring-emerald-400 hover:bg-gray-50'
                                      : 'ring-dark-base/20 bg-white hover:bg-gray-50',
                            )}
                        >
                            <div
                                className={cn(
                                    'w-14 sm:w-16 shrink-0 self-stretch flex justify-center items-center font-semibold text-base sm:text-lg',
                                    isSelected ? 'text-blue-500' : 'text-dark-base',
                                )}
                            >
                                {LABELS[idx]}
                            </div>
                            <div className="flex-1 flex items-center py-3 pr-3 gap-x-2 min-w-0">
                                <span className="flex-1 text-sm sm:text-base leading-snug">
                                    {option}
                                </span>
                                {pct > 0 && (
                                    <span className="text-sm text-gray-400 font-mono shrink-0">
                                        {pct}%
                                    </span>
                                )}
                                {isLifelineSuggestion && !hasUsedLifeline && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 shrink-0">
                                        Pick
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Lifeline button */}
                <Button
                    onClick={handleRequestLifeline}
                    disabled={!canRequestLifeline}
                    className="shrink-0 mt-1 bg-alpha hover:bg-[#423ae2] text-light-base flex items-center h-11 sm:h-12 px-5 text-[14px] rounded-[8px]! transition-colors transform duration-200 gap-x-2"
                >
                    <IoPeopleOutline className="size-4.5" />
                    {hasUsedLifeline
                        ? 'Lifeline used'
                        : lifelineRequested
                          ? 'Waiting…'
                          : 'Ask spectators'}
                </Button>
            </div>
        </>
    );
}
