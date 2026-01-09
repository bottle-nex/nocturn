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
import { usePointsMultiplierAdvStore } from '@/store/new-quiz/usePointsMultiplierAdvStore';

export default function AdvancedDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, updateQuestionPoints, updateQuiz } = useNewQuizStore();
    const singletonPointsCalculator = getSingletonPointsCalculator(
        quiz.questions.length,
        Number(quiz.basePointsPerQuestion),
    );
    const {
        enablePointMultiplier,
        setEnablePointMultiplier,
        enableLinearPointMultiplier,
        setEnableLinearPointMultiplier,
        enableSteppedPointMultiplier,
        setEnableSteppedPointMultiplier,
        inputPointMultiplier,
        setInputPointMultiplier,
    } = usePointsMultiplierAdvStore();
    const [selectedMultiplier, setSelectedMultiplier] = useState<'Linear' | 'Stepped'>('Linear');

    useEffect(() => {
        if (!enableLinearPointMultiplier && !enableSteppedPointMultiplier) {
            setEnablePointMultiplier(false);
        }
    }, [enableLinearPointMultiplier, enableSteppedPointMultiplier, setEnablePointMultiplier]);

    function handleOnCheckedChange(checked: boolean) {
        if (enablePointMultiplier || checked) {
            if (selectedMultiplier === 'Linear') {
                setEnableLinearPointMultiplier(true);
            } else {
                setEnableSteppedPointMultiplier(true);
            }
        }
        setEnablePointMultiplier(!enablePointMultiplier);
    }

    function handleAutoSaveChangeHandler(checked: boolean) {
        updateQuiz({ autoSave: checked });
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
                                {/* Linear */}
                                <div className="flex flex-col items-center space-y-2">
                                    <Button
                                        onClick={() => {
                                            setEnableLinearPointMultiplier(
                                                !enableLinearPointMultiplier,
                                            );
                                            setEnableSteppedPointMultiplier(false);
                                            setSelectedMultiplier('Linear');
                                        }}
                                        className={`flex items-center justify-center w-16 h-12 rounded-lg hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ease-in-out bg-light-base hover:bg-light-base dark:bg-dark-base/30 dark:text-neutral-300 text-neutral-700 ${enableLinearPointMultiplier ? 'border-3 border-neutral-600 dark:border-neutral-500' : 'border border-neutral-300 dark:border-neutral-600'}`}
                                    >
                                        <RiLineChartLine size={20} />
                                    </Button>
                                    <div className="flex items-center justify-start gap-x-1">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            Linear
                                        </span>
                                        <ToolTipComponent content="Select Linear Multiplier (x1.25)">
                                            <AiOutlineQuestionCircle size={12} />
                                        </ToolTipComponent>
                                    </div>
                                </div>

                                {/* Stepped */}
                                <div className="flex flex-col items-center space-y-2">
                                    <Button
                                        onClick={() => {
                                            setEnableSteppedPointMultiplier(
                                                !enableSteppedPointMultiplier,
                                            );
                                            setEnableLinearPointMultiplier(false);
                                            setSelectedMultiplier('Stepped');
                                        }}
                                        className={`flex items-center justify-center w-16 h-12 rounded-lg hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ease-in-out bg-light-base hover:bg-light-base dark:bg-dark-base/30 dark:text-neutral-300 text-neutral-700 ${enableSteppedPointMultiplier ? 'border-3 border-neutral-600 dark:border-neutral-500' : 'border border-neutral-300 dark:border-neutral-600'}`}
                                    >
                                        <HiChartBar size={20} />
                                    </Button>
                                    <div className="flex items-center justify-start gap-x-1">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                            Stepped
                                        </span>
                                        <ToolTipComponent content="Cusotmize your points multiplier">
                                            <AiOutlineQuestionCircle size={12} />
                                        </ToolTipComponent>
                                    </div>
                                </div>
                            </div>

                            {(enableSteppedPointMultiplier || enableLinearPointMultiplier) && (
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
