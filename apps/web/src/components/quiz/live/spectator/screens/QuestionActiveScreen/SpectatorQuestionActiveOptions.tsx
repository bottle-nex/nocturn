import { getResponsiveGap } from '@/components/canvas/CanvasOptions';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useState, useEffect } from 'react';
import { MdHelp, MdTimer, MdCheckCircle } from 'react-icons/md';
import { FaUsers } from 'react-icons/fa';

type Hex = `#${string}`;

export default function SpectatorQuestionActiveOptions() {
    const { currentQuestion, quiz: liveQuiz, activeLifelineSession } = useLiveQuizStore();

    const { handleSpectatorLifelineResponse } = useWebSocket();
    const [selectedLifelineOption, setSelectedLifelineOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const template = templates.find((t) => t.id === liveQuiz?.theme);

    useEffect(() => {
        setSelectedLifelineOption(null);
    }, [currentQuestion?.id]);

    // Timer for lifeline countdown
    useEffect(() => {
        if (activeLifelineSession?.isActive) {
            const interval = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, activeLifelineSession.expiresAt - now);
                setTimeLeft(Math.ceil(remaining / 1000));

                if (remaining <= 0) {
                    clearInterval(interval);
                    setTimeLeft(null);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [activeLifelineSession]);

    useEffect(() => {
        if (!activeLifelineSession?.isActive) {
            setSelectedLifelineOption(null);
        }
    }, [activeLifelineSession]);

    if (!currentQuestion) return null;

    const maxHeight = 12;
    const barColors = template?.bars ?? (['#3b82f6'] as Hex[]);

    function handleLifelineOptionSelect(index: number) {
        if (!activeLifelineSession?.isActive || !currentQuestion) return;
        if (selectedLifelineOption !== null) return;

        setSelectedLifelineOption(index);
        handleSpectatorLifelineResponse({
            questionId: currentQuestion.id,
            selectedOption: index,
        });
    }

    return (
        <div className="w-full flex flex-col items-center justify-center gap-y-5 p-8 rounded-xl z-50">
            {activeLifelineSession?.isActive && (
                <div className="w-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40 border border-yellow-300 dark:border-yellow-700 p-4 rounded-xl shadow-lg">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <MdHelp className="w-5 h-5" />
                            <h3 className="font-bold text-lg">Lifeline Request Active!</h3>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-300">
                                <FaUsers className="w-4 h-4" />
                                <span>
                                    Help {activeLifelineSession.participantCount} participant
                                    {activeLifelineSession.participantCount > 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 text-orange-700 dark:text-orange-300">
                                <MdTimer className="w-4 h-4" />
                                <span className="font-mono font-bold">
                                    {timeLeft || 0}s remaining
                                </span>
                            </div>
                        </div>

                        {selectedLifelineOption !== null ? (
                            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                <MdCheckCircle className="w-4 h-4" />
                                <span className="font-medium">
                                    Response recorded: Option {selectedLifelineOption + 1}
                                </span>
                            </div>
                        ) : (
                            <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                                Click an option below to help!
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div
                className={cn(
                    'w-full h-full flex items-end justify-center',
                    getResponsiveGap(currentQuestion),
                )}
            >
                {currentQuestion.options.map((option, idx) => {
                    const color = barColors[idx % barColors.length] as Hex;
                    const canSelectForLifeline =
                        activeLifelineSession?.isActive && selectedLifelineOption === null;
                    const isSelectedForLifeline = selectedLifelineOption === idx;
                    const isLifelineActive = activeLifelineSession?.isActive;

                    return (
                        <div key={idx} className="flex flex-col gap-y-2 w-full">
                            <div
                                onClick={() =>
                                    canSelectForLifeline && handleLifelineOptionSelect(idx)
                                }
                                className={cn(
                                    'group relative isolate flex w-full select-none items-stretch overflow-hidden rounded-2xl',
                                    'border border-white/10 bg-white/[0.03] transition-all duration-200',
                                    // Lifeline interactivity
                                    canSelectForLifeline &&
                                        'hover:-translate-y-0.5 active:translate-y-0 cursor-pointer hover:shadow-xl',
                                    // Selected for lifeline
                                    isSelectedForLifeline &&
                                        'ring-2 ring-green-400 shadow-green-400/25',
                                    // Lifeline active but not selected
                                    isLifelineActive &&
                                        !isSelectedForLifeline &&
                                        canSelectForLifeline &&
                                        'ring-1 ring-yellow-400/50 hover:ring-yellow-400',
                                    // Not lifeline active or already selected
                                    !canSelectForLifeline &&
                                        !isSelectedForLifeline &&
                                        'hover:-translate-y-0.5 active:translate-y-0',
                                )}
                                style={{
                                    boxShadow: isSelectedForLifeline
                                        ? '0 0 0 2px #10b981, 0 10px 40px rgba(16, 185, 129, 0.2)'
                                        : isLifelineActive && canSelectForLifeline
                                          ? '0 6px 25px rgba(245, 158, 11, 0.15)'
                                          : '0 6px 20px rgba(0,0,0,0.25)',
                                    backgroundColor: template?.background_color,
                                }}
                            >
                                <div
                                    className="w-3 transition-all duration-200"
                                    style={{
                                        backgroundColor: isSelectedForLifeline ? '#10b981' : color,
                                    }}
                                />

                                <div className="flex min-h-[64px] flex-1 items-center gap-10 px-4 md:gap-4 md:px-5">
                                    {/* Lifeline help indicator */}
                                    {isLifelineActive && (
                                        <div
                                            className={cn(
                                                'flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full transition-all duration-200',
                                                canSelectForLifeline && !isSelectedForLifeline
                                                    ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 animate-pulse'
                                                    : isSelectedForLifeline
                                                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
                                            )}
                                        >
                                            {isSelectedForLifeline ? (
                                                <>
                                                    <MdCheckCircle className="w-3 h-3" />
                                                    <span className="hidden sm:inline">SENT</span>
                                                </>
                                            ) : canSelectForLifeline ? (
                                                <>
                                                    <MdHelp className="w-3 h-3" />
                                                    <span className="hidden sm:inline">HELP!</span>
                                                </>
                                            ) : (
                                                <span className="w-3 h-3"></span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <div className="text-sm md:text-base">{option}</div>
                                    </div>

                                    {isSelectedForLifeline && (
                                        <div className="text-green-500 animate-pulse">
                                            <MdCheckCircle className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-end h-full flex-1 min-w-0 px-1">
                                <div
                                    className="w-full rounded-tr-md sm:rounded-tr-2xl transition-all duration-700 ease-in-out border border-white/20 z-50"
                                    style={{
                                        height: `${maxHeight}px`,
                                        backgroundColor: isSelectedForLifeline
                                            ? '#10b981'
                                            : template?.bars[idx] || '#4F46E5',
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
