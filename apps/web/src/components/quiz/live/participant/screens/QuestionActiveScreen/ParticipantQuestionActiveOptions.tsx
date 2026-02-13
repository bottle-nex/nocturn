import { useState, useEffect } from 'react';
import { FaDotCircle, FaRegCircle, FaLifeRing } from 'react-icons/fa';
import { getResponsiveGap } from '@/components/canvas/CanvasOptions';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { cn } from '@/lib/utils';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { QuizPhaseEnum } from '@nocturn/types';

type Hex = `#${string}`;

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

    const barColors = liveQuiz.template?.bars ?? (['#3b82f6'] as Hex[]);
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
        handleParticipantRequestLifeline({
            questionId: currentQuestion.id,
        });
    }

    const getOptionStyle = (idx: number, color: Hex, isSelected: boolean) => {
        const isLifelineSuggestion =
            lifelineResult?.wasSuccessful && lifelineResult.mostPopularOption === idx;

        let boxShadow = isSelected
            ? `0 0 0 1px ${color}55, 0 10px 30px ${color}25`
            : '0 6px 20px #00000040';

        if (isLifelineSuggestion && !isSelected) {
            boxShadow = `0 0 0 2px #10b981, 0 6px 20px #10b9814d`;
        }

        return {
            boxShadow,
            backgroundColor: liveQuiz.template.backgroundColor,
        };
    };

    const getVotePercentage = (idx: number): number => {
        if (!barData || totalVotes === 0) return 0;
        const votes = barData[idx] || 0;
        return Math.round((votes / totalVotes) * 100);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center gap-y-5 p-8 rounded-xl z-10 relative">
            {shouldShowBars && barData && (
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-4 right-4 w-full max-w-xs bg-neutral-900/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg p-3 space-y-3 z-50 pointer-events-auto flex flex-col">
                        <span className="py-1 w-full flex justify-center items-center">
                            Spectator Votes
                        </span>
                        {barData.map((votes: number, idx: number) => {
                            const color = barColors[idx % barColors.length] as Hex;
                            const percentage = getVotePercentage(idx);
                            return (
                                <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs text-neutral-300">
                                        <span>Option {idx + 1}</span>
                                        <span>{percentage}%</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-neutral-700 overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-500 ease-in-out"
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col gap-3 mb-4">
                <div className="flex justify-center">
                    <button
                        onClick={handleRequestLifeline}
                        disabled={!canRequestLifeline}
                        className={cn(
                            'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
                            'border shadow-lg',
                            !canRequestLifeline
                                ? 'bg-gray-500 border-gray-400 cursor-not-allowed opacity-50 text-gray-300'
                                : 'bg-blue-600 border-blue-500 hover:bg-blue-700 hover:border-blue-600 cursor-pointer text-white hover:shadow-xl transform hover:scale-105',
                        )}
                    >
                        <FaLifeRing className="w-4 h-4" />
                        {hasUsedLifeline ? 'Lifeline Used' : 'Ask Spectators for Help'}
                    </button>
                </div>
            </div>

            <div
                className={cn(
                    'w-full h-full flex items-end justify-center',
                    getResponsiveGap(currentQuestion),
                )}
            >
                {currentQuestion.options.map((option, idx) => {
                    const color = barColors[idx % barColors.length] as Hex;
                    const isSelected = selected === idx;
                    const isDisabled = selected !== null && !isSelected;
                    const isLifelineSuggestion =
                        lifelineResult?.wasSuccessful && lifelineResult.mostPopularOption === idx;

                    return (
                        <div key={idx} className="flex flex-col gap-y-2 w-full">
                            <div
                                onClick={() => !isDisabled && handleSelectOption(idx)}
                                className={cn(
                                    'group relative isolate flex w-full select-none items-stretch overflow-hidden rounded-2xl',
                                    'border border-white/10 bg-white/[0.03] transition-transform',
                                    !isDisabled &&
                                        'cursor-pointer hover:-translate-y-0.5 active:translate-y-0',
                                    isDisabled && 'opacity-50 cursor-not-allowed',
                                    isLifelineSuggestion && 'ring-2 ring-green-400 ring-opacity-60',
                                )}
                                style={getOptionStyle(idx, color, isSelected)}
                            >
                                <div className="w-3" style={{ backgroundColor: color }} />

                                <div className="flex min-h-[64px] flex-1 items-center gap-4 px-4 md:px-5">
                                    <span
                                        className={cn(
                                            'grid size-6 place-items-center rounded-full border transition-all',
                                            isSelected
                                                ? 'border-transparent'
                                                : 'border-white/25 group-hover:border-white/50',
                                        )}
                                    >
                                        {isSelected ? (
                                            <FaDotCircle style={{ color }} className="h-4 w-4" />
                                        ) : (
                                            <FaRegCircle className="h-4 w-4 opacity-70" />
                                        )}
                                    </span>

                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="text-sm md:text-base">{option}</div>
                                        {isLifelineSuggestion && !hasUsedLifeline && (
                                            <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
                                                <FaLifeRing className="w-3 h-3" />
                                                <span className="hidden sm:inline">
                                                    Suggested ({getVotePercentage(idx)}%)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-end h-full flex-1 min-w-0 px-1">
                                <div
                                    className="w-full rounded-tr-md sm:rounded-tr-2xl border border-white/20"
                                    style={{
                                        height: `12px`,
                                        backgroundColor: color,
                                        opacity: 0.3,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
