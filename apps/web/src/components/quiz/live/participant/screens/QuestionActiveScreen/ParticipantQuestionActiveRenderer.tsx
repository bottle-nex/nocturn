'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import ParticipantQuestionActiveOptions from './ParticipantQuestionActiveOptions';
import TimerBar from '@/components/ui/TimerBar';

export default function ParticipantQuestionActiveRenderer() {
    const canvasRef = useRef<HTMLDivElement>(null);
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
            ref={canvasRef}
            className={cn(
                'w-full h-full overflow-hidden flex flex-col items-center justify-center space-y-10',
                'relative p-8',
            )}
        >
            <div className="min-h-[32rem] w-[90%] flex flex-col items-center justify-between">
                <div>
                    <div className="w-full text-3xl text-center">{currentQuestion?.question}</div>
                    <div className="mt-8 flex items-center justify-center z-50">
                        <TimerBar
                            startTime={gameSession.phaseStartTime!}
                            endTime={gameSession.phaseEndTime!}
                        />
                    </div>
                </div>
                <ParticipantQuestionActiveOptions />
            </div>
        </div>
    );
}
