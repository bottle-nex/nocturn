import { cn } from '@/lib/utils';
import CanvasBars from './CanvasBars';
import NewQuizInteractiveIcons from '../quiz/new/NewQuizInteractiveIcons';
import { MouseEvent, useEffect, useState } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { QuestionType } from '@nocturn/types';
import { SELECTION_MODE, useCanvasSelectionStore } from '@/store/new-quiz/useCanvasSelectionStore';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';

export function getResponsiveGap(currentQ: QuestionType): string {
    const optionCount = currentQ?.options?.length || 4;
    if (optionCount <= 2) return 'gap-8 sm:gap-12 md:gap-16';
    if (optionCount === 3) return 'gap-4 sm:gap-8 md:gap-12';
    return 'gap-2 sm:gap-4 md:gap-6 lg:gap-2';
}

export default function CanvasOptions() {
    const [votes, setVotes] = useState([0, 0, 0, 0]);
    const { quiz, currentQuestionIndex } = useNewQuizStore();
    const { currentOn, style, setCurrentOn } = useCanvasSelectionStore();
    const { setState } = useDraftRendererStore();
    const currentQ = quiz.questions[currentQuestionIndex];

    useEffect(() => {
        const interval = setInterval(() => {
            setVotes((prev) => {
                return prev.map(() => {
                    return Math.floor(Math.random() * 80) + 10;
                });
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [currentQ]);

    function getBarHeight(voteValue: number): string {
        const percentage = Math.max(voteValue, 5);
        return `max(${percentage * 0.8}%, 1.5rem)`;
    }

    function optionsTapHandler(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
        setCurrentOn(SELECTION_MODE.OPTION);
        setState(DraftRenderer.QUESTION);
    }

    return (
        <div className="p-2 sm:p-4 pt-40 sm:pt-40 w-full h-full z-10">
            <div className={cn('w-full h-full flex flex-col items-end justify-center')}>
                <div
                    onClick={optionsTapHandler}
                    className={cn(
                        'w-full h-full flex items-end justify-between px-4 rounded-beta gap-x-1',
                        getResponsiveGap(currentQ!),
                        currentOn === SELECTION_MODE.OPTION && style,
                    )}
                >
                    {currentQ?.options?.map((option, idx) => (
                        <CanvasBars
                            key={idx}
                            idx={idx}
                            option={option}
                            votes={votes}
                            currentQ={currentQ}
                            currentQTemplate={quiz.template}
                            getBarHeight={getBarHeight}
                        />
                    )) || []}
                </div>
                <div className="absolute bottom-1 right-1 ">
                    <NewQuizInteractiveIcons />
                </div>
            </div>
        </div>
    );
}
