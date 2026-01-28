import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';
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
        tooltip: 'Select Linear Multiplier (x1.25)',
    },
    {
        type: 'Stepped',
        icon: HiChartBar,
        label: 'Stepped',
        tooltip: 'Customize your points multiplier',
    },
    {
        type: 'Manual',
        icon: BsKeyboardFill,
        label: 'Manual',
        tooltip: 'Manually set your points multiplier',
    },
];

export default function AdvancedDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, updateQuestionPoints, updateQuiz } = useNewQuizStore();
    const singletonPointsCalculator = getSingletonPointsCalculator(
        quiz.questions.length,
        Number(quiz.basePointsPerQuestion),
    );
    const {
        enablePointMultiplier,
        multiplierType,
        inputPointMultiplier,
        setEnablePointMultiplier,
        setMultiplierType,
        setInputPointMultiplier,
    } = usePointsMultiplierAdvStore();

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
    }

    function handleAutoSaveChangeHandler(checked: boolean) {
        updateQuiz({ autoSave: checked });
    }

    function handleMultiplierTypeClick(type: MultiplierType) {
        setMultiplierType(multiplierType === type ? null : type);
    }

    function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        if (value === '') {
            setInputPointMultiplier('');
            return;
        }

        const num = Number(value);
        if (!isNaN(num) && num >= 1) {
            setInputPointMultiplier(value);
        }

        const points = singletonPointsCalculator.calculate_linear_points(Number(value));
        updateQuestionPoints(points);
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
                    <ToolTipComponent content="Do you want to use point multiplier?">
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

                            {multiplierType && (
                                <div className="flex flex-col space-y-2 mt-2">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Customize
                                    </span>

                                    <Input
                                        min={1}
                                        step="0.1"
                                        type="number"
                                        value={inputPointMultiplier}
                                        onChange={handleOnChange}
                                        className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
