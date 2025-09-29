'use client';

import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { RxCross2 } from 'react-icons/rx';
import Options from './Options';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { Input } from '@/components/ui/input';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useEffect, useRef, useState } from 'react';
import { getSingletonPointsCalculator } from '@/lib/singleton-points-calculator';
import { IoIosInfinite } from 'react-icons/io';
import UploadQuizImage from './UploadQuizImage';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/text-area';

const min = 1;
const max = 600;

export default function QuestionsDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, currentQuestionIndex, changeQuestionPoint, getQuestion, editQuestion } =
        useNewQuizStore();

    const currentQ = quiz.questions[currentQuestionIndex];

    // Local states
    const [timerError, setTimerError] = useState<string | null>(null);
    const [basePoints, setBasePoints] = useState<string>(currentQ?.basePoints.toString() || '0');
    const singletonPointsCalculator = getSingletonPointsCalculator(quiz.questions.length);
    const [wrongBasePoints, setWrongBasePoints] = useState<boolean>(false);
    const [timerEdit, setTimerEdit] = useState<'READING_TIME' | 'ACTIVE_TIME'>('ACTIVE_TIME');
    const [timerValue, setTimerValue] = useState<number>(
        timerEdit === 'ACTIVE_TIME' ? (currentQ?.timeLimit ?? 30) : (currentQ?.readingTime ?? 5),
    );
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ✅ New states for explanation and hint
    const [explanation, setExplanation] = useState<string>(currentQ?.explanation || '');
    const [hint, setHint] = useState<string>(currentQ?.hint || '');

    function handleTimerChange(timer: number) {
        if (timer < min || timer > max) {
            setTimerError(`Timer must be between ${min} and ${max} seconds`);
        } else {
            setTimerError(null);
            setTimerValue(timer);

            if (!currentQ?.orderIndex && currentQ?.orderIndex !== 0) return;

            if (timerEdit === 'ACTIVE_TIME') {
                editQuestion(currentQ.orderIndex, { timeLimit: timer });
            } else {
                editQuestion(currentQ.orderIndex, { readingTime: timer });
            }
        }
    }

    function handleBasePointsChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = Number(e.target.value);
        if (value < 0 || isNaN(value)) return;

        setBasePoints(value.toString());
        changeQuestionPoint(currentQuestionIndex, value);
        handleUpdateQuestionPoints(currentQuestionIndex, value);

        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            const prev = getQuestionPoints(currentQuestionIndex - 1) || 0;
            const next = getQuestionPoints(currentQuestionIndex + 1) ?? Infinity;

            if (value === 0 || value < prev || value > next) {
                setWrongBasePoints(true);
            } else {
                setWrongBasePoints(false);
            }
        }, 2000);

        setWrongBasePoints(false);
    }

    function handleUpdateQuestionPoints(questionIndex: number, point: number) {
        const points: number[] = singletonPointsCalculator.set_point_after_current_index(
            questionIndex,
            point,
        );
        let pointsItr = 0;

        while (questionIndex < quiz.questions.length) {
            changeQuestionPoint(questionIndex, points[pointsItr]!);
            questionIndex++;
            pointsItr++;
        }
    }

    function getQuestionPoints(questionIndex: number) {
        return getQuestion(questionIndex)?.basePoints;
    }

    // ✅ Handle explanation change
    function handleExplanationChange(value: string) {
        setExplanation(value);
        if (currentQ?.orderIndex !== undefined) {
            editQuestion(currentQ.orderIndex, { explanation: value });
        }
    }

    // ✅ Handle hint change
    function handleHintChange(value: string) {
        setHint(value);
        if (currentQ?.orderIndex !== undefined) {
            editQuestion(currentQ.orderIndex, { hint: value });
        }
    }

    // Sync local state when current question changes
    useEffect(() => {
        setTimerValue(
            timerEdit === 'ACTIVE_TIME'
                ? (currentQ?.timeLimit ?? 30)
                : (currentQ?.readingTime ?? 5),
        );
    }, [timerEdit, currentQ?.readingTime, currentQ?.timeLimit]);

    useEffect(() => {
        setBasePoints(currentQ?.basePoints.toString() || '0');
        setExplanation(currentQ?.explanation || '');
        setHint(currentQ?.hint || '');
    }, [currentQ?.basePoints, currentQ?.explanation, currentQ?.hint]);

    return (
        <div className="text-neutral-900 dark:text-neutral-100 flex flex-col justify-start items-start gap-y-4 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="w-full flex items-center justify-between border-b border-neutral-300 dark:border-neutral-700 pb-2">
                <div className="text-lg font-medium">Questions</div>
                <RxCross2 onClick={() => setState(DraftRenderer.NONE)} className="cursor-pointer" />
            </div>

            <Options />

            {/* Base Points */}
            <div className="w-full px-2 mt-6">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-primary dark:text-light-base">
                        Base Points
                    </span>
                    <ToolTipComponent content="This is the base points for this question">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    between<span>{getQuestionPoints(currentQuestionIndex - 1) || 0}</span>-
                    <span>{getQuestionPoints(currentQuestionIndex + 1) || <IoIosInfinite />}</span>
                </div>
                <Input
                    type="number"
                    min={getQuestionPoints(currentQuestionIndex - 1)}
                    max={getQuestionPoints(currentQuestionIndex + 1)}
                    value={basePoints}
                    className={`mt-1 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${wrongBasePoints ? 'border border-red-600 text-red-600' : ''}`}
                    onChange={handleBasePointsChange}
                />
            </div>

            {/* Explanation */}
            <div className="w-full px-2 mt-3">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-primary dark:text-light-base">
                        Add Explanation
                    </span>
                    <ToolTipComponent content="Provide a clear explanation visible after the question ends">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Explanation helps users understand the answer and key concepts
                </div>
                <div className="w-full mt-1">
                    <Textarea
                        value={explanation}
                        onChange={(e) => handleExplanationChange(e.target.value)}
                        className={cn(
                            '!text-xs font-light dark:text-neutral-400 text-neutral-700 italic',
                        )}
                    />
                </div>
            </div>

            {/* Timer */}
            <div className="w-full px-2 mt-3">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-primary dark:text-light-base">
                        Timer
                    </span>
                    <ToolTipComponent content="Provide a short hint to help users answer this question effectively">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    add timers for different phases in seconds
                </div>
                <div className="w-full grid grid-cols-2 gap-x-1.5 mt-4">
                    <div
                        onClick={() => setTimerEdit('ACTIVE_TIME')}
                        className={`col-span-1 text-[11px] rounded-md gap-x-1.5 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer px-3 py-2 ${
                            timerEdit === 'ACTIVE_TIME'
                                ? 'border-2 border-neutral-600 dark:border-neutral-500'
                                : 'border border-neutral-300 dark:border-neutral-600'
                        }`}
                    >
                        Question active
                    </div>
                    <div
                        onClick={() => setTimerEdit('READING_TIME')}
                        className={`col-span-1 text-[11px] rounded-md gap-x-1.5 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer px-3 py-2 ${
                            timerEdit === 'READING_TIME'
                                ? 'border-2 border-neutral-600 dark:border-neutral-500'
                                : 'border border-neutral-300 dark:border-neutral-600'
                        }`}
                    >
                        Question reading
                    </div>
                </div>
                <div className="mt-4">
                    {timerEdit && (
                        <>
                            <Input
                                type="number"
                                min={1}
                                max={600}
                                value={timerValue}
                                className={`mt-1 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                    ${timerError ? 'border border-red-600 text-red-600' : ''}`}
                                onChange={(e) => handleTimerChange(Number(e.target.value))}
                            />
                            {timerError && (
                                <p className="text-red-600 text-xs mt-1">{timerError}</p>
                            )}
                        </>
                    )}
                </div>
            </div>

            <UploadQuizImage />

            {/* Hint */}
            <div className="w-full px-2 mt-3">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-primary dark:text-light-base">
                        Add hint
                    </span>
                    <ToolTipComponent content="Provide a short hint to help users answer this question effectively">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    upto 120 characters
                </div>
                <div className="w-full mt-1">
                    <Textarea
                        value={hint}
                        onChange={(e) => handleHintChange(e.target.value)}
                        className={cn(
                            '!text-xs font-light dark:text-neutral-400 text-neutral-700 italic',
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
