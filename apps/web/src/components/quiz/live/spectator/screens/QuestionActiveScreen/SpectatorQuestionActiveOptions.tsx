import { getResponsiveGap } from '@/components/canvas/CanvasOptions';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useState, useEffect } from 'react';

export default function SpectatorQuestionActiveOptions() {
    const {
        currentQuestion,
        quiz: liveQuiz,
        activeLifelineSession,
        lifelineVotes,
    } = useLiveQuizStore();

    const { handleSpectatorLifelineResponse } = useWebSocket();

    const spectatorVotedOption =
        lifelineVotes && typeof (lifelineVotes as any).self === 'number'
            ? (lifelineVotes as any).self as number
            : null;

    const template = templates.find((t) => t.id === liveQuiz?.theme);
    const options = Array.isArray(currentQuestion?.options) ? currentQuestion.options : [];
    const barColors = template?.bars ?? ['#3b82f6'];
    const maxHeight = 12;

    const canVote =
        activeLifelineSession?.isActive &&
        spectatorVotedOption === null;

    function handleLifelineOptionSelect(index: number) {
        if (!canVote || !currentQuestion) return;

        handleSpectatorLifelineResponse({
            questionId: currentQuestion.id,
            selectedOption: index,
        });
    }

    if (!currentQuestion || !activeLifelineSession?.isActive) return null;

    return (
        <div className="relative w-full h-full p-4">
            <div className="absolute top-4 left-4 dark:bg-dark-base dark:text-neutral-200 px-4 py-2 rounded shadow-md z-50 font-semibold text-sm">
                Lifeline demanded — start voting
            </div>

            <div
                className={cn(
                    'w-full h-full flex items-end justify-center mt-20',
                    getResponsiveGap(currentQuestion),
                )}
            >
                {options.map((option, idx) => {
                    const color = barColors[idx % barColors.length];
                    const isSelected = spectatorVotedOption === idx;

                    return (
                        <div key={idx} className="flex flex-col gap-y-2 w-full">
                            <div
                                onClick={() => canVote && handleLifelineOptionSelect(idx)}
                                className={cn(
                                    'group relative flex w-full items-stretch rounded-xl overflow-hidden border transition-all duration-200 px-4 py-3',
                                    'border-white/10 bg-white/[0.03]',
                                    canVote && 'hover:shadow-lg hover:scale-[1.01] cursor-pointer',
                                    isSelected && 'ring-2 ring-green-400 shadow-green-400/25',
                                    !canVote && !isSelected && 'opacity-75 cursor-not-allowed',
                                )}
                                style={{
                                    backgroundColor: template?.background_color,
                                    boxShadow: isSelected
                                        ? '0 0 0 2px #10b981, 0 8px 30px rgba(16, 185, 129, 0.2)'
                                        : '0 4px 12px rgba(0,0,0,0.15)',
                                }}
                            >
                                <div className="flex-1 text-sm md:text-base text-center font-medium">
                                    {option}
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-end h-full flex-1 min-w-0 px-1">
                                <div
                                    className="w-full rounded-tr-md sm:rounded-tr-xl transition-all duration-700 ease-in-out border border-white/20"
                                    style={{
                                        height: `${maxHeight}px`,
                                        backgroundColor: isSelected ? '#10b981' : color,
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
