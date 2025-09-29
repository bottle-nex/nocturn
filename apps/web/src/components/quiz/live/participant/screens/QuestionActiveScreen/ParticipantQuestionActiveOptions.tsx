import { getResponsiveGap } from '@/components/canvas/CanvasOptions';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { useState, useEffect, useMemo } from 'react';
import { FaDotCircle, FaRegCircle, FaLifeRing } from 'react-icons/fa';
import { MdHelp, MdTimer, MdCheckCircle } from 'react-icons/md';
import { QuizPhaseEnum } from '@/types/prisma-types';
import { LiveResponseBars } from './LiveBars';

type Hex = `#${string}`;

export default function ParticipantQuestionActiveOptions() {
    const {
        currentQuestion,
        quiz: liveQuiz,
        gameSession,
        alreadyResponded,
        setAlreadyResponded,
        lifelineRequested,
        lifelineExpiresAt,
        lifelineResult,
        hasUsedLifeline,
        getLifelineVoteCounts,
        activeLifelineSession
    } = useLiveQuizStore();

    const { handleParticipantResponseMessage, handleParticipantRequestLifeline } = useWebSocket();
    const [selected, setSelected] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const template = templates.find((t) => t.id === liveQuiz?.theme);

    const { setResponse } = useLiveParticipantsStore();
    const { participantData } = useLiveParticipantStore();

    // Reset on question change
    useEffect(() => {
        setSelected(null);
        setAlreadyResponded(false);
    }, [currentQuestion?.id, setAlreadyResponded]);

    // Timer for lifeline countdown
    useEffect(() => {
        if (lifelineRequested && lifelineExpiresAt) {
            const interval = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, lifelineExpiresAt - now);
                setTimeLeft(Math.ceil(remaining / 1000));

                if (remaining <= 0) {
                    clearInterval(interval);
                    setTimeLeft(null);
                }
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setTimeLeft(null);
        }
    }, [lifelineRequested, lifelineExpiresAt]);

    if (!currentQuestion) return null;

    const maxHeight = 12;
    const barColors = template?.bars ?? (['#3b82f6'] as Hex[]);

    const liveVoteCounts = useMemo(() => {
        if (!lifelineRequested || !activeLifelineSession?.isActive) {
            return [0, 0, 0, 0];
        }
        return getLifelineVoteCounts(); // Call it here
    }, [lifelineRequested, activeLifelineSession, getLifelineVoteCounts]);

    const totalVotes = liveVoteCounts.reduce((sum, count) => sum + count, 0);

    const canRequestLifeline =
        gameSession?.currentPhase === QuizPhaseEnum.QUESTION_ACTIVE &&
        !hasUsedLifeline &&
        !alreadyResponded &&
        !lifelineRequested;

    function handleSelectOption(index: number) {
        if (selected !== null) return;
        if (alreadyResponded) return;

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

    // FIXED: Visual highlight for lifeline suggestion
    const getOptionStyle = (idx: number, color: Hex, isSelected: boolean) => {
        const isLifelineSuggestion =
            lifelineResult?.wasSuccessful && lifelineResult.mostPopularOption === idx;

        let boxShadow = isSelected
            ? `0 0 0 1px ${color}55, 0 10px 30px ${color}25`
            : '0 6px 20px rgba(0,0,0,0.25)';

        if (isLifelineSuggestion && !isSelected) {
            boxShadow = `0 0 0 2px #10b981, 0 6px 20px rgba(16, 185, 129, 0.3)`;
        }

        return {
            boxShadow,
            backgroundColor: template?.background_color,
        };
    };

    const getVotePercentage = (idx: number): number => {
        if (!lifelineResult || lifelineResult.totalResponses === 0) return 0;
        const votes = lifelineResult.optionBreakdown[idx] || 0;
        return Math.round((votes / lifelineResult.totalResponses) * 100);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center gap-y-5 p-8 rounded-xl z-20">

            <div className="absolute top-0 right-0 z-50">
                <LiveResponseBars
                    position="top-right"
                    size="md"
                    showPercentages
                    animated
                />
            </div>

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
                                : lifelineRequested
                                    ? 'bg-yellow-600 border-yellow-500 cursor-not-allowed text-white animate-pulse'
                                    : 'bg-blue-600 border-blue-500 hover:bg-blue-700 hover:border-blue-600 cursor-pointer text-white hover:shadow-xl transform hover:scale-105',
                        )}
                    >
                        <FaLifeRing className="w-4 h-4" />
                        {hasUsedLifeline ? (
                            'Lifeline Used'
                        ) : lifelineRequested ? (
                            <>
                                <MdTimer className="w-4 h-4 animate-spin" />
                                {`Waiting... ${timeLeft || 0}s`}
                            </>
                        ) : (
                            'Ask Spectators for Help'
                        )}
                    </button>
                </div>

                {lifelineRequested && (
                    <div className="bg-neutral-900 dark:bg-dark-base/70 border p-3 rounded-lg">
                        <div className="flex items-center gap-2 dark:text-neutral-200">
                            <MdHelp className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Spectators are helping you! Results coming soon...
                            </span>
                        </div>
                    </div>
                )}

                {lifelineResult && (
                    <div
                        className={cn(
                            'p-4 rounded-lg border',
                            lifelineResult.wasSuccessful
                                ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                                : 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
                        )}
                    >
                        <div
                            className={cn(
                                'text-sm font-medium mb-2',
                                lifelineResult.wasSuccessful
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-orange-800 dark:text-orange-200',
                            )}
                        >
                            {lifelineResult.wasSuccessful ? (
                                <div className="flex items-center gap-2">
                                    <MdCheckCircle className="w-4 h-4 text-green-500" />
                                    <span>
                                        Spectators suggest: Option{' '}
                                        {(lifelineResult.mostPopularOption || 0) + 1}
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <span className="text-orange-500">!</span> No clear consensus
                                    from spectators
                                </>
                            )}
                        </div>
                        <div className="text-xs opacity-75">
                            {lifelineResult.totalResponses} spectator
                            {lifelineResult.totalResponses !== 1 ? 's' : ''} responded
                        </div>

                        {/* Show vote breakdown */}
                        <div className="mt-3 grid grid-cols-4 gap-2">
                            {lifelineResult.optionBreakdown.map((votes: number, idx: number) => (
                                <div
                                    key={idx}
                                    className="text-center p-2 rounded bg-white/50 dark:bg-black/20"
                                >
                                    <div className="text-xs font-bold">Opt {idx + 1}</div>
                                    <div className="text-sm">{votes} votes</div>
                                    <div className="text-xs opacity-75">
                                        {getVotePercentage(idx)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Options */}
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
                                    isLifelineSuggestion &&
                                    'ring-2 ring-green-400 ring-opacity-60 animate-pulse',
                                )}
                                style={getOptionStyle(idx, color, isSelected)}
                            >
                                <div className="w-3" style={{ backgroundColor: color }} />

                                <div className="flex min-h-[64px] flex-1 items-center gap-10 px-4 md:gap-4 md:px-5">
                                    <span
                                        className={cn(
                                            'grid size-6 place-items-center rounded-full border transition-all',
                                            isSelected
                                                ? 'border-transparent'
                                                : 'border-white/25 group-hover:border-white/50',
                                        )}
                                    >
                                        {isSelected ? (
                                            <FaDotCircle
                                                style={{ color: color }}
                                                className="h-4 w-4"
                                            />
                                        ) : (
                                            <FaRegCircle className="h-4 w-4 opacity-70" />
                                        )}
                                    </span>

                                    <div className="flex-1 flex items-center justify-between">
                                        <div className="text-sm md:text-base">{option}</div>
                                        {isLifelineSuggestion && (
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
                                    className="w-full rounded-tr-md sm:rounded-tr-2xl transition-all duration-700 ease-in-out border border-white/20 z-50"
                                    style={{
                                        height: `${maxHeight}px`,
                                        backgroundColor: template?.bars[idx] || '#4F46E5',
                                    }}
                                />
                                <div className="mt-1 sm:mt-2 min-h-[1.5rem] sm:min-h-[2rem] flex items-center justify-center w-full">
                                    <div className="text-xs sm:text-sm text-center px-0.5 sm:px-1 leading-tight font-light break-words">
                                        <span className="hidden sm:inline">{option}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}