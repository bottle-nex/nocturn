'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import { Checkbox } from '@/components/ui/checkbox';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';
import { MdOutlineDragIndicator } from 'react-icons/md';
import ColoredInput from '@/components/utility/ColoredInput';

export default function Options() {
    const { quiz, currentQuestionIndex } = useNewQuizStore();
    const { editQuestionAndBroadcast } = useCollaborativeEdit();
    const currentQ = quiz.questions[currentQuestionIndex];

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const bars = quiz?.theme?.theme?.bars ?? [];

    const handleCorrectAnswerChange = (idx: number) => {
        editQuestionAndBroadcast(currentQuestionIndex, {
            correctAnswer: idx,
            id: currentQ?.id,
        });
    };

    function handleInputChange(value: string, index: number) {
        if (!currentQ) return;
        const newOptions = [...currentQ.options];
        newOptions[index] = value;

        editQuestionAndBroadcast(
            currentQuestionIndex,
            { options: newOptions, id: currentQ.id },
            { debounce: true },
        );
    }

    function handleDragStart(index: number) {
        setDraggedIndex(index);
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function handleDrop(dropIndex: number) {
        if (draggedIndex === null || !currentQ || draggedIndex === dropIndex) return;

        const newOptions = [...currentQ.options];
        const [draggedItem] = newOptions.splice(draggedIndex, 1);

        if (draggedItem !== undefined) {
            newOptions.splice(dropIndex, 0, draggedItem);
        }

        let newCorrectAnswer = currentQ.correctAnswer;

        if (draggedIndex === currentQ.correctAnswer) {
            newCorrectAnswer = dropIndex;
        } else if (draggedIndex < currentQ.correctAnswer && dropIndex >= currentQ.correctAnswer) {
            newCorrectAnswer -= 1;
        } else if (draggedIndex > currentQ.correctAnswer && dropIndex <= currentQ.correctAnswer) {
            newCorrectAnswer += 1;
        }

        editQuestionAndBroadcast(currentQuestionIndex, {
            options: newOptions,
            correctAnswer: newCorrectAnswer,
            id: currentQ.id,
        });

        setDraggedIndex(null);
    }

    function handleDeleteOption(index: number) {
        if (!currentQ || index === currentQ.correctAnswer) return;
        const newOptions = [...currentQ.options];
        newOptions.splice(index, 1);
        let newCorrectAnswer = currentQ.correctAnswer;
        if (index < currentQ.correctAnswer) {
            newCorrectAnswer -= 1;
        }

        editQuestionAndBroadcast(currentQuestionIndex, {
            options: newOptions,
            correctAnswer: newCorrectAnswer,
            id: currentQ.id,
        });
    }

    if (!currentQ?.options) return null;

    return (
        <div className="w-full flex flex-col justify-start items-start gap-y-3">
            {currentQ.options.map((option, idx) => (
                <div
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className={cn(
                        'flex justify-start items-center gap-x-3 w-full transition-all duration-200 ease-out rounded-md',
                        draggedIndex === idx ? 'opacity-50' : '',
                    )}
                >
                    <MdOutlineDragIndicator
                        size={26}
                        className="text-neutral-500 dark:text-neutral-400 cursor-grab"
                    />

                    <Checkbox
                        checked={currentQ.correctAnswer === idx}
                        onCheckedChange={() => handleCorrectAnswerChange(idx)}
                        className="scale-150 p-px border border-neutral-300 dark:border-neutral-800 cursor-pointer"
                    />

                    <ColoredInput
                        color={bars[idx]}
                        value={option}
                        onChange={(val) => handleInputChange(val, idx)}
                    />
                    <Button
                        onClick={() => handleDeleteOption(idx)}
                        disabled={currentQ.options.length === 1 || currentQ.correctAnswer === idx}
                        className="bg-dark-base"
                        variant={'ghost'}
                        size={'icon'}
                    >
                        <RxCross1 className="size-3" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
