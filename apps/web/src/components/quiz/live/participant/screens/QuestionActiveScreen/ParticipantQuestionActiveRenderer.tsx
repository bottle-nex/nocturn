'use client';
import { useRef } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { QuizPhaseEnum } from '@nocturn/types';
import { IoPeopleOutline } from 'react-icons/io5';
import ParticipantQuestionActiveOptions from './ParticipantQuestionActiveOptions';
import TopTimerBarCompoment from '@/components/ui/TopTimerBarComponent';
import AppLogo from '@/components/app/AppLogo';

export default function ParticipantQuestionActiveRenderer() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const { currentQuestion, gameSession, alreadyResponded, lifelineRequested, hasUsedLifeline } =
        useLiveQuizStore();
    const { handleParticipantRequestLifeline } = useWebSocket();

    if (!currentQuestion || !gameSession) {
        return (
            <div className="text-center text-neutral-400 w-full">
                Error in getting current question
            </div>
        );
    }

    const canRequestLifeline =
        gameSession?.currentPhase === QuizPhaseEnum.QUESTION_ACTIVE &&
        !hasUsedLifeline &&
        !alreadyResponded &&
        !lifelineRequested;

    function handleRequestLifeline() {
        if (!canRequestLifeline || !currentQuestion) return;
        handleParticipantRequestLifeline({ questionId: currentQuestion.id });
    }

    return (
        <div
            ref={canvasRef}
            className="w-full h-full min-h-0 flex-1 flex justify-center items-center relative overflow-hidden px-3 pt-4 sm:px-0 sm:py-0"
        >
            <TopTimerBarCompoment
                startTime={gameSession.phaseStartTime!}
                endTime={gameSession.phaseEndTime!}
            />
            <section className="relative z-10 w-full max-w-6xl mx-auto h-full sm:h-[80dvh] flex flex-col bg-light-alpha rounded-xl overflow-hidden items-center">
                <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-4 sm:px-7 shrink-0 w-full">
                    <AppLogo
                        className="pointer-events-none"
                        textColor="text-black dark:text-black"
                        withText
                    />

                    {/* ask spectators button */}
                    <button
                        onClick={handleRequestLifeline}
                        disabled={!canRequestLifeline}
                        className="flex items-center gap-x-2 px-3 py-2.5 rounded-md text-[14px] tracking-normal bg-dark-base text-light-base transition-opacity duration-200"
                        style={{
                            opacity: canRequestLifeline ? 1 : 0.5,
                            cursor: canRequestLifeline ? 'pointer' : 'default',
                        }}
                    >
                        <IoPeopleOutline className="size-3.5" />
                        {hasUsedLifeline
                            ? 'Lifeline used'
                            : lifelineRequested
                              ? 'Spectators are voting'
                              : 'Ask spectators'}
                    </button>
                </div>

                <div className="flex flex-col items-center w-full max-w-2xl min-h-0 flex-1 overflow-y-auto gap-y-4">
                    <div className="px-4 sm:px-6 pt-0 pb-2 sm:pb-5 shrink-0 w-full flex flex-col justify-center items-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-base/40 mb-2">
                            {/* Question */}
                        </p>
                        <p className="text-dark-base leading-relaxed font-medium text-xl sm:text-[32px] break-words w-full">
                            Q. {currentQuestion.question}
                        </p>
                    </div>
                    <div className="shrink-0 px-4 sm:px-6 pb-6 flex flex-col w-full">
                        <ParticipantQuestionActiveOptions />
                    </div>
                </div>
            </section>
        </div>
    );
}
