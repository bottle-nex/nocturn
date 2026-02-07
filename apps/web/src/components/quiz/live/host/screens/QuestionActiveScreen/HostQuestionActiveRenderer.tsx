'use client';
import CountDownClock from '@/components/ui/CountDownClock';
import { getImageContainerWidth, useWidth } from '@/hooks/useWidth';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import HostQuestionActiveOptions from './HostQuestionActiveOptions';
import LiveQuizBackendActions from '@/lib/backend/live/live-quiz-backend-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

export default function HostQuestionActiveRenderer() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const canvasWidth = useWidth(canvasRef);
    const { currentQuestion, gameSession, quiz, updateNextQuestion } = useLiveQuizStore();
    const { session } = useUserSessionStore();

    // step 1: check if any not asked question exists on the local store
    // step 2: if yes, then no need to fetch from server
    // step 3: if no, then fetch a not asked question from the server

    useEffect(() => {
        if (!currentQuestion || !quiz || !gameSession) return;

        // fetch from server
        if (quiz.questions.length === 0 || !quiz.questions) {

        }


    }, []);

    useEffect(() => {
        if (!quiz || !currentQuestion) return;

        if (!currentQuestion.isAsked) return;

        // find any other question which is not asked
        const question = quiz.questions.find((q) => !q.isAsked);

        if (!question) {
            // fetch from backend
            const fetchQuestion = async () => {
                if (!quiz) return;
                const question = await LiveQuizBackendActions.getQuestionDetailByIndex(
                    quiz.id,
                    0,
                    session?.user.token,
                );

                if (!question) {
                    // end of the quiz and show button to show final leaderboards
                    return;
                }
                updateNextQuestion(question);
            };
            fetchQuestion();
            return;
        }
        updateNextQuestion(question);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quiz]);

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
                    <HostQuestionActiveOptions />
                </div>
            </div>
            <div className="flex flex-col items-center gap-y-3">
                <CountDownClock
                    startTime={gameSession.phaseStartTime!}
                    endTime={gameSession.phaseEndTime!}
                />
                <div>Participants and Spectators are now answering to this question</div>
            </div>
        </div>
    );
}
