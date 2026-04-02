import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import { Input } from '@/components/ui/input';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { RiLineChartLine } from 'react-icons/ri';
import { HiChartBar } from 'react-icons/hi';
import { getSingletonPointsCalculator } from '@/lib/singleton-points-calculator';
import { Button } from '@/components/ui/button';
import {
    usePointsMultiplierAdvStore,
    MultiplierType,
} from '@/store/new-quiz/usePointsMultiplierAdvStore';
import { BsKeyboardFill } from 'react-icons/bs';
import { cn } from '@/lib/utils';
import { IconType } from 'react-icons';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';

interface MultiplierOption {
    type: MultiplierType;
    icon: IconType;
    label: string;
    tooltip: string;
}

const MULTIPLIER_OPTIONS: MultiplierOption[] = [
    {
        type: 'Linear',
        icon: RiLineChartLine,
        label: 'Linear',
        tooltip: 'Points increase evenly per question (e.g. +25 each)',
    },
    {
        type: 'Stepped',
        icon: HiChartBar,
        label: 'Stepped',
        tooltip: 'Points jump in tiers — bigger gaps for later questions',
    },
    {
        type: 'Manual',
        icon: BsKeyboardFill,
        label: 'Manual',
        tooltip: 'Set each question point individually',
    },
];

export default function AdvancedDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, updateQuestionPoints, changeQuestionPoint } = useNewQuizStore();
    const { updateQuizAndBroadcast } = useCollaborativeEdit();
    const {
        enablePointMultiplier,
        multiplierType,
        inputPointMultiplier,
        manualPoints,
        setEnablePointMultiplier,
        setMultiplierType,
        setInputPointMultiplier,
        setManualPoints,
        setManualPointAt,
    } = usePointsMultiplierAdvStore();

    const [calculatedPoints, setCalculatedPoints] = useState<number[]>([]);

    // When multiplier type changes OR questions are added, recalculate
    useEffect(() => {
        if (!enablePointMultiplier || !multiplierType) return;

        if (multiplierType === 'Manual') {
            // Initialize/extend manual points from current question basePoints
            if (manualPoints.length !== quiz.questions.length) {
                setManualPoints(quiz.questions.map((q) => q.basePoints));
            }
            setCalculatedPoints([]);
            return;
        }

        const num = Number(inputPointMultiplier);
        if (isNaN(num) || num < 1) return;

        // The singleton now auto-refreshes when quiz.questions.length changes
        const calculator = getSingletonPointsCalculator(
            quiz.questions.length,
            Number(quiz.basePointsPerQuestion),
        );

        if (multiplierType === 'Linear') {
            const points = calculator.calculate_linear_points(num);
            setCalculatedPoints(points);
            updateQuestionPoints(points);
        } else if (multiplierType === 'Stepped') {
            const points = calculator.calculate_stepped_points(num);
            setCalculatedPoints(points);
            updateQuestionPoints(points);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [multiplierType, enablePointMultiplier, quiz.questions.length]);

    useEffect(() => {
        if (!multiplierType) {
            setEnablePointMultiplier(false);
        }
    }, [multiplierType, setEnablePointMultiplier]);

    function handleOnCheckedChange(checked: boolean) {
        setEnablePointMultiplier(checked);
        if (checked && !multiplierType) {
            setMultiplierType('Linear');
        }
        if (!checked) {
            setCalculatedPoints([]);
            // Reset all question points back to the default basePointsPerQuestion
            const defaultPoints = Number(quiz.basePointsPerQuestion) || 100;
            const resetPoints = quiz.questions.map(() => defaultPoints);
            updateQuestionPoints(resetPoints);
        }
    }

    function handleAutoSaveChangeHandler(checked: boolean) {
        updateQuizAndBroadcast({ autoSave: checked });
    }

    function handleMultiplierTypeClick(type: MultiplierType) {
        setMultiplierType(multiplierType === type ? null : type);
    }

    function handleLinearChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        if (value === '') {
            setInputPointMultiplier('');
            setCalculatedPoints([]);
            return;
        }

        const num = Number(value);
        if (isNaN(num) || num < 1) return;

        setInputPointMultiplier(value);
        const calculator = getSingletonPointsCalculator(
            quiz.questions.length,
            Number(quiz.basePointsPerQuestion),
        );
        const points = calculator.calculate_linear_points(num);
        setCalculatedPoints(points);
        updateQuestionPoints(points);
    }

    function handleSteppedChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        if (value === '') {
            setInputPointMultiplier('');
            setCalculatedPoints([]);
            return;
        }

        const num = Number(value);
        if (isNaN(num) || num < 1) return;

        setInputPointMultiplier(value);
        const calculator = getSingletonPointsCalculator(
            quiz.questions.length,
            Number(quiz.basePointsPerQuestion),
        );
        const points = calculator.calculate_stepped_points(num);
        setCalculatedPoints(points);
        updateQuestionPoints(points);
    }

    function handleManualPointChange(index: number, value: number) {
        if (isNaN(value) || value < 0) return;
        setManualPointAt(index, value);
        changeQuestionPoint(index, value);
    }

    return (
        <div className="text-neutral-900 dark:text-neutral-100 flex flex-col justify-start items-start gap-y-4 select-none">
            <div className="w-full flex items-center justify-between border-b border-neutral-300 dark:border-neutral-700 pb-2">
                <div className="text-lg font-medium">Advance Options</div>
                <RxCross2 onClick={() => setState(DraftRenderer.NONE)} className="cursor-pointer" />
            </div>

            {/* Auto-Save Component */}
            <div className="w-full px-2 mt-6">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Auto Save
                    </span>
                    <ToolTipComponent content="Turn this on to save your quiz questions automatically.">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Enable auto save
                    </span>
                    <Switch
                        className="cursor-pointer"
                        checked={quiz.autoSave}
                        onCheckedChange={handleAutoSaveChangeHandler}
                    />
                </div>
            </div>

            {/* Point Multiplier Component */}
            <div className="w-full px-2 mt-6">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Points Multiplier
                    </span>
                    <ToolTipComponent content="Scale question points progressively so later questions are worth more.">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>

                <div className="flex w-full items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Enable points multiplier
                    </span>
                    <Switch
                        className="cursor-pointer"
                        checked={enablePointMultiplier}
                        onCheckedChange={handleOnCheckedChange}
                    />
                </div>

                <div className="mt-4">
                    {enablePointMultiplier && (
                        <div className="flex flex-col space-y-3 mt-6">
                            <div className="flex items-center justify-start gap-x-1">
                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    Multiplier Types
                                </span>
                                <ToolTipComponent content="Choose either Linear or Stepped Point Multiplier">
                                    <AiOutlineQuestionCircle size={15} />
                                </ToolTipComponent>
                            </div>

                            <div className="flex flex-row items-center gap-x-3 dark:text-neutral-300 text-neutral-700">
                                {MULTIPLIER_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = multiplierType === option.type;

                                    return (
                                        <div
                                            key={option.type}
                                            className="flex flex-col items-center space-y-2"
                                        >
                                            <Button
                                                onClick={() =>
                                                    handleMultiplierTypeClick(option.type)
                                                }
                                                className={cn(
                                                    'flex items-center justify-center w-16 h-12 rounded-lg transition-all duration-200 ease-in-out',
                                                    'bg-light-base hover:bg-light-base dark:bg-dark-base/30',
                                                    'dark:text-neutral-300 text-neutral-700',
                                                    'hover:-translate-y-0.5 hover:shadow-sm border',
                                                    isSelected
                                                        ? 'border-indigo-600/80 dark:border-indigo-600/60'
                                                        : 'border-neutral-300 dark:border-neutral-800',
                                                )}
                                            >
                                                <Icon size={20} />
                                            </Button>
                                            <div className="flex items-center justify-start gap-x-1">
                                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                    {option.label}
                                                </span>
                                                <ToolTipComponent content={option.tooltip}>
                                                    <AiOutlineQuestionCircle size={12} />
                                                </ToolTipComponent>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* ---- Linear Mode ---- */}
                            {multiplierType === 'Linear' && (
                                <div className="flex flex-col space-y-3 mt-2">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Multiplier — points increase evenly per question
                                    </span>
                                    <Input
                                        min={1}
                                        step="0.05"
                                        type="number"
                                        placeholder="1.25"
                                        value={inputPointMultiplier}
                                        onChange={handleLinearChange}
                                        className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    {calculatedPoints.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {calculatedPoints.map((pts, i) => (
                                                <span
                                                    key={i}
                                                    className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                                                >
                                                    Q{i + 1}: {pts}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ---- Stepped Mode ---- */}
                            {multiplierType === 'Stepped' && (
                                <div className="flex flex-col space-y-3 mt-2">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Multiplier — points jump in tiers (Q1-3, Q4-6, Q7+)
                                    </span>
                                    <Input
                                        min={1}
                                        step="0.05"
                                        type="number"
                                        placeholder="1.5"
                                        value={inputPointMultiplier}
                                        onChange={handleSteppedChange}
                                        className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    {calculatedPoints.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {calculatedPoints.map((pts, i) => (
                                                <span
                                                    key={i}
                                                    className={cn(
                                                        'text-[10px] px-2 py-0.5 rounded-full font-medium',
                                                        i <= 2
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            : i <= 5
                                                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
                                                    )}
                                                >
                                                    Q{i + 1}: {pts}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ---- Manual Mode ---- */}
                            {multiplierType === 'Manual' && (
                                <div className="flex flex-col space-y-3 mt-2">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Set points for each question individually
                                    </span>
                                    <div className="flex flex-col gap-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                                        {quiz.questions.map((q, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-x-3"
                                            >
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 w-8 shrink-0 font-medium">
                                                    Q{i + 1}
                                                </span>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={manualPoints[i] ?? q.basePoints}
                                                    onChange={(e) =>
                                                        handleManualPointChange(
                                                            i,
                                                            Number(e.target.value),
                                                        )
                                                    }
                                                    className="h-8 text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
