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
import { TRUE_FALSE_OPTIONS } from '@nocturn/types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function Options() {
    const { quiz, currentQuestionIndex } = useNewQuizStore();
    const { editQuestionAndBroadcast } = useCollaborativeEdit();
    const currentQ = quiz.questions[currentQuestionIndex];

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const isTrueFalse = currentQ?.format === 'TRUE_FALSE';

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
            <label id="question-format-label" className="text-sm">
                Question format
            </label>
            <Select
                value={currentQ.format ?? 'MULTIPLE_CHOICE'}
                onValueChange={(format) => {
                    if (format !== 'MULTIPLE_CHOICE' && format !== 'TRUE_FALSE') return;
                    setDraggedIndex(null);
                    editQuestionAndBroadcast(currentQuestionIndex, {
                        id: currentQ.id,
                        format,
                        options:
                            format === 'TRUE_FALSE'
                                ? [...TRUE_FALSE_OPTIONS]
                                : [...currentQ.options],
                        correctAnswer: format === 'TRUE_FALSE' ? 0 : currentQ.correctAnswer,
                    });
                }}
            >
                <SelectTrigger aria-labelledby="question-format-label">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                </SelectContent>
            </Select>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {isTrueFalse
                    ? 'Choose whether the statement is true or false.'
                    : 'Select the correct answer and edit the choices.'}
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
                        <span className="w-full px-4 py-2.5 rounded-md bg-neutral-200 dark:bg-dark-base">
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
