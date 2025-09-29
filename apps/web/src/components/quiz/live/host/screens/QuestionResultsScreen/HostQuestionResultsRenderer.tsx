'use client';
import { Button } from '@/components/ui/button';
import CountDownClock from '@/components/ui/CountDownClock';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { getImageContainerWidth, useWidth } from '@/hooks/useWidth';
import { cn } from '@/lib/utils';
import { useLiveQuizHostStore } from '@/store/live-quiz/useLiveQuizHostStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { HostScreenEnum } from '@/types/prisma-types';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { MdNavigateNext } from 'react-icons/md';

export default function HostQuestionResultsRenderer() {
    const { handleHostQuestionPreviewPageChange } = useWebSocket();
    const canvasRef = useRef<HTMLDivElement>(null);
    const canvasWidth = useWidth(canvasRef);
    const { currentQuestion, gameSession, updateGameSession } = useLiveQuizStore();
    const { emptyLiveResponses } = useLiveQuizHostStore();

    useEffect(() => {
        emptyLiveResponses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!currentQuestion || !gameSession) {
        return (
            <div className="text-center text-neutral-400 w-full">
                Error in getting current question
            </div>
        );
    }

    function handleOnClick() {
        handleHostQuestionPreviewPageChange(HostScreenEnum.QUESTION_PREVIEW);
        updateGameSession?.({ hostScreen: HostScreenEnum.QUESTION_PREVIEW });
    }

    return (
        <div
            className={cn(
                'w-full h-full overflow-hidden flex flex-col items-center justify-center ',
                'relative',
            )}
        >
            <div className="min-h-[32rem] w-[90%] flex flex-col justify-between">
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
                    <div className="flex">
                        <CountDownClock
                            startTime={gameSession.phaseStartTime!}
                            endTime={gameSession.phaseEndTime!}
                        />
                    </div>
                    <div>Participants and Spectators are now seeing results of this question</div>
                </div>

                <Button
                    className={cn(
                        'absolute bottom-4 left-5 cursor-pointer z-50 flex items-center justify-center gap-x-1 group',
                        'bg-light-base dark:bg-dark-primary dark:text-light-base text-dark-primary text-xs',
                        'px-3.5 !pl-4 py-1.5 text-xs rounded-md tracking-wider',
                        'hover:-translate-y-0.5 transition-all transform duration-150',
                    )}
                    onClick={handleOnClick}
                >
                    Next Question
                    <MdNavigateNext className="group-hover:translate-x-0.5 transform ease-in duration-150" />
                </Button>
            </div>
        </div>
    );
}
