import { cn } from '@/lib/utils';
import CanvasBars from './CanvasBars';
import NewQuizInteractiveIcons from '../quiz/new/NewQuizInteractiveIcons';
import { SELECTION_MODE } from './Canvas';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { templates } from '@/lib/templates';
import { QuestionType } from '@nocturn/types';

interface CanvasOptionsProps {
    selectionMode: SELECTION_MODE;
    setSelectionMode: Dispatch<SetStateAction<SELECTION_MODE>>;
}

export function getResponsiveGap(currentQ: QuestionType): string {
    const optionCount = currentQ?.options?.length || 4;
    if (optionCount <= 2) return 'gap-8 sm:gap-12 md:gap-16';
    if (optionCount === 3) return 'gap-4 sm:gap-8 md:gap-12';
    return 'gap-2 sm:gap-4 md:gap-6 lg:gap-8';
}

export default function CanvasOptions({ selectionMode, setSelectionMode }: CanvasOptionsProps) {
    const [votes, setVotes] = useState([0, 0, 0, 0]);
    const { quiz, currentQuestionIndex } = useNewQuizStore();
    const currentQ = quiz.questions[currentQuestionIndex];
    const currentQTemplate = templates.find((t) => t.id === quiz.theme);

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

    return (
        <div className="p-2 sm:p-4 pt-40 sm:pt-48 w-full h-full z-[9999]">
            <div className={cn('w-full h-full flex flex-col items-end justify-center')}>
                <div
                    className={cn(
                        'w-full h-full flex items-end justify-center ',
                        getResponsiveGap(currentQ!),
                    )}
                >
                    {currentQ?.options?.map((option, idx) => (
                        <CanvasBars
                            key={idx}
                            idx={idx}
                            option={option}
                            votes={votes}
                            currentQ={currentQ}
                            currentQTemplate={currentQTemplate}
                            getBarHeight={getBarHeight}
                        />
                    )) || []}
                </div>
                <div className="absolute bottom-1 right-1 ">
                    <NewQuizInteractiveIcons
                        selectionMode={selectionMode}
                        setSelectionMode={setSelectionMode}
                    />
                </div>
            </div>
        </div>
    );
}
