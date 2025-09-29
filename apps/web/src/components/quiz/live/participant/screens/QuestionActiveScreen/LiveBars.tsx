import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { QuizPhaseEnum } from '@/types/prisma-types';
import { useState, useEffect } from 'react';
import { FaChartBar, FaEye } from 'react-icons/fa';
import { MdPeople } from 'react-icons/md';

interface LiveResponseBarsProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    size?: 'sm' | 'md' | 'lg';
    showPercentages?: boolean;
    animated?: boolean;
}

export function LiveResponseBars({
    position = 'top-right',
    size = 'md',
    showPercentages = true,
    animated = true
}: LiveResponseBarsProps) {
    const {
        currentQuestion,
        quiz,
        gameSession,
        liveResponses,
        getLiveResponsePercentages
    } = useLiveQuizStore();

    const [isVisible, setIsVisible] = useState(true);
    const template = templates.find((t) => t.id === quiz?.theme);

    // Only show during active phase and when there are responses
    const shouldShow = gameSession?.currentPhase === QuizPhaseEnum.QUESTION_ACTIVE &&
        currentQuestion?.options &&
        liveResponses.totalResponses > 0;

    const percentages = getLiveResponsePercentages();
    const maxPercentage = Math.max(...percentages);

    // Position classes
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4'
    };

    // Size configurations
    const sizeConfig = {
        sm: {
            container: 'w-48 p-3',
            bar: 'h-2',
            text: 'text-xs',
            maxHeight: 32
        },
        md: {
            container: 'w-56 p-4',
            bar: 'h-3',
            text: 'text-sm',
            maxHeight: 48
        },
        lg: {
            container: 'w-64 p-5',
            bar: 'h-4',
            text: 'text-base',
            maxHeight: 64
        }
    };

    const config = sizeConfig[size];

    if (!shouldShow) return null;

    return (
        <div className={cn(
            'fixed z-50 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20',
            'shadow-2xl transition-all duration-300',
            positionClasses[position],
            config.container,
            !isVisible && 'opacity-0 pointer-events-none'
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FaChartBar className={cn('text-blue-400', config.text)} />
                    <span className={cn('font-medium text-white', config.text)}>
                        Live Responses
                    </span>
                </div>

                <button
                    onClick={() => setIsVisible(!isVisible)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <FaEye className={cn('text-gray-400 hover:text-white', config.text)} />
                </button>
            </div>

            {/* Response count */}
            <div className="flex items-center gap-1 mb-3 text-gray-300">
                <MdPeople className={config.text} />
                <span className={cn('font-medium', config.text)}>
                    {liveResponses.totalResponses} response{liveResponses.totalResponses !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Response bars */}
            <div className="space-y-2">
                {currentQuestion?.options?.slice(0, 4).map((option, idx) => {
                    const percentage = percentages[idx] || 0;
                    const count = liveResponses.optionCounts[idx] || 0;
                    const color = template?.bars?.[idx] || '#3b82f6';

                    return (
                        <div key={idx} className="space-y-1">
                            {/* Option label and stats */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div
                                        className="w-3 h-3 rounded-sm flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className={cn(
                                        'text-white font-medium truncate',
                                        config.text
                                    )}>
                                        Option {idx + 1}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-gray-300">
                                    <span className={cn('font-mono', config.text)}>
                                        {count}
                                    </span>
                                    {showPercentages && (
                                        <span className={cn('font-mono min-w-[3rem] text-right', config.text)}>
                                            {percentage}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'transition-all duration-700 ease-out rounded-full',
                                        config.bar,
                                        animated && 'animate-pulse'
                                    )}
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: color,
                                        boxShadow: percentage > 0 ? `0 0 8px ${color}40` : 'none'
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Leading option indicator */}
            {maxPercentage > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                    {percentages.map((percentage, idx) => {
                        if (percentage !== maxPercentage || percentage === 0) return null;

                        const color = template?.bars?.[idx] || '#3b82f6';
                        return (
                            <div key={idx} className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ backgroundColor: color }}
                                />
                                <span className={cn('text-white font-medium', config.text)}>
                                    Option {idx + 1} leading with {percentage}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}