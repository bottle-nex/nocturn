'use client';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { getResponsiveGap } from '@/components/canvas/CanvasOptions';
import { useLiveQuizHostStore } from '@/store/live-quiz/useLiveQuizHostStore';

export default function HostQuestionActiveOptions() {
    const { currentQuestion, quiz: liveQuiz } = useLiveQuizStore();
    const { liveResponses } = useLiveQuizHostStore();

    const template = templates.find((t) => t.id === liveQuiz?.theme);
    if (!currentQuestion?.options) return null;

    const maxVotes = Math.max(...liveResponses, 1);
    const maxHeight = 120;

    return (
        <div className="w-full flex flex-col items-center justify-center gap-y-5 p-8 rounded-xl z-50">
            <div
                className={cn(
                    'w-full h-full flex items-end justify-center',
                    getResponsiveGap(currentQuestion),
                )}
            >
                {currentQuestion.options.map((option, idx) => {
                    const votes = liveResponses[idx] ?? 0;
                    const height = (votes / maxVotes) * maxHeight;

                    return (
                        <div
                            key={idx}
                            className="flex flex-col items-center justify-end h-full flex-1 min-w-0 px-1"
                        >
                            <div className="text-xs sm:text-sm font-semibold mb-1">
                                {votes > 0 && votes}
                            </div>
                            <div
                                className="w-full rounded-tr-md sm:rounded-tr-2xl transition-all duration-700 ease-in-out border border-white/20 z-50"
                                style={{
                                    height: `${height}px`,
                                    backgroundColor: template?.bars[idx] || '#4F46E5',
                                }}
                            />
                            <div className="mt-1 sm:mt-2 min-h-[1.5rem] sm:min-h-[2rem] flex items-center justify-center w-full">
                                <div className="text-xs sm:text-sm text-center px-0.5 sm:px-1 leading-tight font-light break-words">
                                    <span className="hidden sm:inline">{option}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
