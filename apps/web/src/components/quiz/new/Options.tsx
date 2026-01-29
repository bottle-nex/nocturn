'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { MdOutlineDragIndicator } from 'react-icons/md';
import ColoredInput from '@/components/utility/ColoredInput';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';

export default function Options() {
    const { quiz, currentQuestionIndex } = useNewQuizStore();
    const { editQuestionAndBroadcast } = useCollaborativeEdit();
    const currentQ = quiz.questions[currentQuestionIndex];
    const currentQTemplate = templates.find((t) => t.id === quiz.theme);

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleCorrectAnswerChange = (idx: number) => {
        editQuestionAndBroadcast(currentQuestionIndex, { correctAnswer: idx });
    };

    const handleInputChange = (value: string, index: number) => {
        if (!currentQ) return;
        const newOptions = [...currentQ.options];
        newOptions[index] = value;
        editQuestionAndBroadcast(currentQuestionIndex, { options: newOptions }, { debounce: true });
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (dropIndex: number) => {
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
        });

        setDraggedIndex(null);
    };

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
                        'flex justify-start items-center gap-x-3 w-full transition-all duration-200 ease-outrounded-md',
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
                        color={currentQTemplate?.bars?.[idx]}
                        value={option}
                        onChange={(val) => handleInputChange(val, idx)}
                    />
                </div>
            ))}
        </div>
    );
}
