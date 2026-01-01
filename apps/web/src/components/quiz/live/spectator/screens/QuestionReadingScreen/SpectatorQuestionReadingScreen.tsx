'use client';

import CountDownClock from '@/components/ui/CountDownClock';
import { getImageContainerWidth, useWidth } from '@/hooks/useWidth';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import Image from 'next/image';
import { useRef } from 'react';

export default function SpectatorQuestionReadingScreen() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const canvasWidth = useWidth(canvasRef);
    const { currentQuestion, gameSession } = useLiveQuizStore();

    if (!currentQuestion || !gameSession) {
        return (
            <div className="text-center text-neutral-400 w-full">
                Error in getting current question
            </div>
        );
    }

    return (
        <div
            className={cn(
                'w-full h-full overflow-hidden flex flex-col items-center justify-center',
                'relative',
            )}
        >
            <div className="min-h-128 w-[90%] flex flex-col justify-between">
                <div
                    className={cn('w-full text-3xl text-center')}
                    dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
                <div className="flex flex-row items-center justify-center">
                    {currentQuestion.imageUrl && (
                        <div
                            className={cn(
                                'h-full flex flex-col justify-end p-2 sm:p-4 relative mb-15',
                                getImageContainerWidth(canvasWidth),
                            )}
                        >
                            <div className="w-full overflow-hidden relative rounded-sm">
                                <Image
                                    src={currentQuestion.imageUrl}
                                    alt="Question reference image"
                                    className="object-contain w-full h-auto"
                                    width={500}
                                    height={500}
                                    unoptimized
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center gap-y-3">
                    <CountDownClock
                        startTime={gameSession.phaseStartTime!}
                        endTime={gameSession.phaseEndTime!}
                    />
                </div>
            </div>
        </div>
    );
}
