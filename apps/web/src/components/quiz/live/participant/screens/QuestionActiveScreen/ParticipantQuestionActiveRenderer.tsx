'use client';
import { useRef } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import ParticipantQuestionActiveOptions from './ParticipantQuestionActiveOptions';
import TopTimerBarCompoment from '@/components/ui/TopTimerBarComponent';
import AppLogo from '@/components/app/AppLogo';

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
        <div ref={canvasRef} className="w-full h-full flex justify-center items-center">
            <section className="max-w-7xl mx-auto h-[80dvh] w-full rounded-xl relative overflow-hidden bg-white/80 z-10 flex flex-col items-center p-18 gap-y-10">
                <div className="absolute top-2 left-2">
                    <AppLogo
                        size={100}
                        textColor="dark:text-dark-base text-dark-base -right-8"
                        withText
                    />
                </div>
                <TopTimerBarCompoment
                    startTime={gameSession.phaseStartTime!}
                    endTime={gameSession.phaseEndTime!}
                />
                <div className="text-dark-base text-3xl">Q. {currentQuestion.question}</div>
                <div className="flex-1 h-full w-full flex flex-col items-center gap-y-5 text-[18px]">
                    <ParticipantQuestionActiveOptions />
                </div>
            </section>
        </div>
    );
}
