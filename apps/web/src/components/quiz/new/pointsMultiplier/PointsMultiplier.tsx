import ToolTipComponent from '@/components/utility/TooltipComponent';
import { usePointsMultiplierAdvStore } from '@/store/new-quiz/usePointsMultiplierAdvStore';
import { IconType } from 'react-icons';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { RiLineChartLine } from 'react-icons/ri';
import { HiChartBar } from 'react-icons/hi';
import { BsKeyboardFill } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { getSingletonPointsCalculator } from '@/lib/singleton-points-calculator';
import { LinearMode } from './LinearMode';
import { SteppedMode } from './SteppedMode';
import { ManualMode } from './ManualMode';
import { cn } from '@/lib/utils';
import { PointsMultiplier as PointsMultiplierEnum } from '@nocturn/types';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';

interface MultiplierOption {
    type: PointsMultiplierEnum;
    icon: IconType;
    label: string;
    tooltip: string;
}

const MULTIPLIER_OPTIONS: MultiplierOption[] = [
    {
        type: PointsMultiplierEnum.LINEAR,
        icon: RiLineChartLine,
        label: 'Linear',
        tooltip: "Every question get's increase in points linearly",
    },
    {
        type: PointsMultiplierEnum.STEPPED,
        icon: HiChartBar,
        label: 'Stepped',
        tooltip: 'Points jump in batches',
    },
    {
        type: PointsMultiplierEnum.MANUAL,
        icon: BsKeyboardFill,
        label: 'Manual',
        tooltip: 'Complete ownership, set each question point individually',
    },
];

interface PointsMultiplierProps {
    calculatedPoints: number[];
    setCalculatedPoints: (calPoints: number[]) => void;
}

export default function PointsMultiplier({
    calculatedPoints,
    setCalculatedPoints,
}: PointsMultiplierProps) {
    const { quiz, updateQuestionPoints, changeQuestionPoint } = useNewQuizStore();
    const { updateQuizAndBroadcast } = useCollaborativeEdit();
    const {
        enablePointMultiplier,
        multiplierType,
        inputPointMultiplier,
        steppedBatchSize,
        steppedIncrement,
        manualPoints,
        setEnablePointMultiplier,
        setMultiplierType,
        setInputPointMultiplier,
        setSteppedBatchSize,
        setSteppedIncrement,
        setManualPoints,
        setManualPointAt,
    } = usePointsMultiplierAdvStore();

    useEffect(() => {
        if (!enablePointMultiplier || !multiplierType) return;

        if (multiplierType === PointsMultiplierEnum.MANUAL) {
            if (manualPoints.length !== quiz.questions.length) {
                setManualPoints(quiz.questions.map((q) => q.basePoints));
            }
            setCalculatedPoints([]);
            return;
        }

        const num = Number(inputPointMultiplier);
        if (isNaN(num) || num < 1) return;

        const calculator = getSingletonPointsCalculator(
            quiz.questions.length,
            Number(quiz.basePointsPerQuestion),
        );

        if (multiplierType === PointsMultiplierEnum.LINEAR) {
            const points = calculator.calculate_linear_points(num);
            setCalculatedPoints(points);
            updateQuestionPoints(points);
        } else if (multiplierType === PointsMultiplierEnum.STEPPED) {
            if (steppedIncrement < 1) return;
            const points = calculator.calculate_stepped_points(steppedIncrement, steppedBatchSize);
            setCalculatedPoints(points);
            updateQuestionPoints(points);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        multiplierType,
        enablePointMultiplier,
        quiz.questions.length,
        steppedBatchSize,
        steppedIncrement,
    ]);

    function handleMultiplierTypeClick(type: PointsMultiplierEnum) {
        const newType = multiplierType === type ? PointsMultiplierEnum.NONE : type;
        setMultiplierType(newType);
        updateQuizAndBroadcast({ pointsMultiplier: newType });
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

    function handleSteppedIncrementChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        if (value === '') {
            setSteppedIncrement(0);
            setCalculatedPoints([]);
            return;
        }
        const num = Math.floor(Number(value));
        if (isNaN(num) || num < 1) return;
        setSteppedIncrement(num);
        updateQuizAndBroadcast({ pointsIncrement: num });
        const calculator = getSingletonPointsCalculator(
            quiz.questions.length,
            Number(quiz.basePointsPerQuestion),
        );
        const points = calculator.calculate_stepped_points(num, steppedBatchSize);
        setCalculatedPoints(points);
        updateQuestionPoints(points);
    }

    function handleBatchSizeChange(size: number) {
        if (size < 1 || size > 15) return;
        setSteppedBatchSize(size);
        updateQuizAndBroadcast({ batchSize: size });
        if (steppedIncrement < 1) return;
        const calculator = getSingletonPointsCalculator(
            quiz.questions.length,
            Number(quiz.basePointsPerQuestion),
        );
        const points = calculator.calculate_stepped_points(steppedIncrement, size);
        setCalculatedPoints(points);
        updateQuestionPoints(points);
    }

    function handleManualPointChange(index: number, value: number) {
        if (isNaN(value) || value < 0) return;
        setManualPointAt(index, value);
        changeQuestionPoint(index, value);
    }

    function renderMultiplier() {
        switch (multiplierType) {
            case PointsMultiplierEnum.LINEAR: {
                return (
                    <LinearMode
                        inputPointMultiplier={inputPointMultiplier}
                        calculatedPoints={calculatedPoints}
                        onChange={handleLinearChange}
                    />
                );
            }
            case PointsMultiplierEnum.STEPPED: {
                return (
                    <SteppedMode
                        steppedIncrement={steppedIncrement}
                        calculatedPoints={calculatedPoints}
                        batchSize={steppedBatchSize}
                        onIncrementChange={handleSteppedIncrementChange}
                        onBatchSizeChange={handleBatchSizeChange}
                    />
                );
            }
            case PointsMultiplierEnum.MANUAL: {
                return (
                    <ManualMode
                        questions={quiz.questions}
                        manualPoints={manualPoints}
                        onPointChange={handleManualPointChange}
                    />
                );
            }
        }
    }

    useEffect(() => {
        if (!multiplierType) {
            setEnablePointMultiplier(false);
        }
    }, [multiplierType, setEnablePointMultiplier]);

    return (
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
                        <div key={option.type} className="flex flex-col items-center space-y-2">
                            <Button
                                onClick={() => handleMultiplierTypeClick(option.type)}
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

            {renderMultiplier()}
        </div>
    );
}
