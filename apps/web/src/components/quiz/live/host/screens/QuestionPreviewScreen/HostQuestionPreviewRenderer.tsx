'use client';
import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';
import { getImageContainerWidth, useWidth } from '@/hooks/useWidth';
import Image from 'next/image';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import HostQuestionPreviewOptions from './HostQuestionPreviewOptions';
import { QuestionType } from '@/types/prisma-types';
import LiveQuizBackendActions from '@/lib/backend/live-quiz-backend-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

export default function HostQuestionPreviewRenderer() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const canvasWidth = useWidth(canvasRef);
    const { currentQuestion, nextQuestion, quiz, updateCurrentQuestion, updateQuiz } =
        useLiveQuizStore();
    const { session } = useUserSessionStore();

    useEffect(() => {
        if (!quiz) return;

        if (quiz.questions === undefined || quiz.questions.length === 0) {
            async function fetchQuestion() {
                if (!quiz) return;

                const question: QuestionType =
                    await LiveQuizBackendActions.getQuestionDetailByIndex(
                        quiz.id,
                        0,
                        session?.user.token,
                    );

                if (question) {
                    const isQuestionExists = quiz?.questions.find((q) => q && q.id === question.id);

                    if (!isQuestionExists) {
                        updateQuiz({
                            questions: [question],
                        });
                    }
                    updateCurrentQuestion(question);
                }
            }
            fetchQuestion();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quiz]);

    useEffect(() => {
        if (!nextQuestion) {
            // this should not be hit by our frontend
            // this will only hit if the quiz ends
            return;
        }

        updateCurrentQuestion(nextQuestion);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quiz]);

    if (!currentQuestion) {
        return (
            <div className="text-center text-neutral-700 dark:text-neutral-400 text-2xl h-full w-full ">
                Select a question to preview
            </div>
        );
    }

    return (
        <div
            ref={canvasRef}
            className={cn(
                'w-full h-full overflow-hidden flex flex-col items-center justify-center ',
                'relative',
            )}
        >
            <div className="min-h-[32rem] w-[90%] flex flex-col justify-between">
                <div className="w-full flex gap-x-2">
                    <div className="text-3xl text-center w-full">
                        <span className="text-[31px] h-full pt-[2px]">
                            {currentQuestion.orderIndex + 1}.
                        </span>{' '}
                        {currentQuestion.question}
                    </div>
                </div>
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
                    <HostQuestionPreviewOptions />
                </div>
            </div>
        </div>
    );
}
