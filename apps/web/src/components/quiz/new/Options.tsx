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
import { getQuestionFormatDefaults, type QuestionFormat } from '@nocturn/types';

export default function Options() {
    const { quiz, currentQuestionIndex } = useNewQuizStore();
    const { editQuestionAndBroadcast } = useCollaborativeEdit();
    const currentQ = quiz.questions[currentQuestionIndex];
    const isTrueFalse = currentQ?.format === 'TRUE_FALSE';

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const bars = quiz?.template.bars ?? [];

    const handleCorrectAnswerChange = (idx: number) => {
        editQuestionAndBroadcast(currentQuestionIndex, {
            correctAnswer: idx,
            id: currentQ?.id,
        });
    };

    function handleInputChange(value: string, index: number) {
        if (!currentQ || isTrueFalse) return;
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
        if (isTrueFalse || draggedIndex === null || !currentQ || draggedIndex === dropIndex) return;

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
        if (
            !currentQ ||
            isTrueFalse ||
            currentQ.options.length <= 2 ||
            index === currentQ.correctAnswer
        )
            return;
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

    function handleAddOption() {
        if (!currentQ || isTrueFalse || currentQ.options.length >= 6) return;
        const newOptions = [...currentQ.options, ''];
        editQuestionAndBroadcast(currentQuestionIndex, {
            options: newOptions,
            id: currentQ.id,
        });
    }

    if (!currentQ?.options) return null;

    return (
        <div className="w-full flex flex-col justify-start items-start gap-y-3">
            <label className="w-full flex flex-col gap-y-2 text-sm">
                Question format
                <select
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-dark-base px-3 py-2"
                    value={currentQ.format ?? 'MULTIPLE_CHOICE'}
                    onChange={(event) => {
                        setDraggedIndex(null);
                        editQuestionAndBroadcast(currentQuestionIndex, {
                            id: currentQ.id,
                            ...getQuestionFormatDefaults(event.target.value as QuestionFormat),
                        });
                    }}
                >
                    <option value="MULTIPLE_CHOICE">Multiple choice</option>
                    <option value="TRUE_FALSE">True or false</option>
                </select>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Changing format resets the answer choices. Select the correct answer below.
            </p>
            {currentQ.options.map((option, idx) => (
                <div
                    key={idx}
                    draggable={!isTrueFalse}
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className={cn(
                        'flex justify-start items-center gap-x-3 w-full transition-all duration-200 ease-out rounded-md',
                        draggedIndex === idx ? 'opacity-50' : '',
                    )}
                >
                    {!isTrueFalse && (
                        <MdOutlineDragIndicator
                            size={26}
                            className="text-neutral-500 dark:text-neutral-400 cursor-grab"
                        />
                    )}

                    <Checkbox
                        aria-label={`Mark ${option || `option ${idx + 1}`} as correct`}
                        checked={currentQ.correctAnswer === idx}
                        onCheckedChange={() => handleCorrectAnswerChange(idx)}
                        className="scale-150 p-px border border-neutral-300 dark:border-neutral-800 cursor-pointer"
                    />

                    {isTrueFalse ? (
                        <span className="w-full rounded-md bg-neutral-200 dark:bg-dark-base px-4 py-2.5">
                            {option}
                        </span>
                    ) : (
                        <ColoredInput
                            color={bars[idx]}
                            value={option}
                            onChange={(val) => handleInputChange(val, idx)}
                        />
                    )}
                    {!isTrueFalse && (
                        <Button
                            onClick={() => handleDeleteOption(idx)}
                            disabled={
                                currentQ.options.length <= 2 || currentQ.correctAnswer === idx
                            }
                            className="dark:bg-dark-base bg-neutral-200"
                            variant={'ghost'}
                            size={'icon'}
                        >
                            <RxCross1 className="size-3" />
                        </Button>
                    )}
                </div>
            ))}
            {!isTrueFalse && (
                <Button
                    disabled={currentQ.options.length >= 6}
                    className={cn(
                        'w-full dark:text-dark-alpha dark:bg-light-alpha hover:bg-light-base',
                        'text-light-alpha bg-dark-alpha hover:bg-dark-base',
                        currentQ.options.length >= 6 && 'cursor-not-allowed opacity-50',
                    )}
                    onClick={handleAddOption}
                >
                    Add Option
                </Button>
            )}
        </div>
    );
}
