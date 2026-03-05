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
            className="w-full h-full flex justify-center items-center relative overflow-hidden"
        >
            <TopTimerBarCompoment
                startTime={gameSession.phaseStartTime!}
                endTime={gameSession.phaseEndTime!}
            />
            <section className="relative z-10 w-full max-w-6xl mx-auto h-[80dvh] flex flex-col bg-light-alpha rounded-xl overflow-hidden items-center">
                <div className="flex items-center justify-between px-7 pb-4 shrink-0 w-full">
                    <AppLogo
                        size={100}
                        className="-left-7.5 pointer-events-none"
                        textColor="-right-9 text-black dark:text-black"
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

                <div className="flex flex-col items-center w-2xl gap-y-4">
                    <div className="px-6 pt-0 pb-5 shrink-0 w-full">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-base/40 mb-2">
                            Question
                        </p>
                        <p
                            className="text-dark-base leading-relaxed font-medium"
                            style={{ fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)' }}
                        >
                            {currentQuestion.question}
                        </p>
                    </div>
                    <div className="flex-1 min-h-0 px-6 pb-6 flex flex-col w-full">
                        <ParticipantQuestionActiveOptions />
                    </div>
                </div>
            </section>
        </div>
    );
}
