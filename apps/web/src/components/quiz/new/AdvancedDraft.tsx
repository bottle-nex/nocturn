import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import {
    usePointsMultiplierAdvStore,
    MultiplierEnum,
} from '@/store/new-quiz/usePointsMultiplierAdvStore';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';
import PointsMultiplier from './pointsMultiplier/PointsMultiplier';

export default function AdvancedDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, updateQuestionPoints } = useNewQuizStore();
    const { updateQuizAndBroadcast } = useCollaborativeEdit();
    const [calculatedPoints, setCalculatedPoints] = useState<number[]>([]);

    const {
        enablePointMultiplier,
        multiplierType,
        setEnablePointMultiplier,
        setMultiplierType,
    } = usePointsMultiplierAdvStore();

    useEffect(() => {
        if (!multiplierType) {
            setEnablePointMultiplier(false);
        }
    }, [multiplierType, setEnablePointMultiplier]);

    function handleAutoSaveChangeHandler(checked: boolean) {
        updateQuizAndBroadcast({ autoSave: checked });
    }

    function handleOnCheckedChange(checked: boolean) {
        setEnablePointMultiplier(checked);
        if (checked && !multiplierType) {
            setMultiplierType(MultiplierEnum.LINEAR);
        }
        if (!checked) {
            setCalculatedPoints([]);
            const defaultPoints = Number(quiz.basePointsPerQuestion) || 100;
            updateQuestionPoints(quiz.questions.map(() => defaultPoints));
        }
    }

    return (
        <div className="text-neutral-900 dark:text-neutral-100 flex flex-col justify-start items-start gap-y-4 select-none">
            <div className="w-full flex items-center justify-between border-b border-neutral-300 dark:border-neutral-700 pb-2">
                <div className="text-lg font-medium">Advance Options</div>
                <RxCross2 onClick={() => setState(DraftRenderer.NONE)} className="cursor-pointer" />
            </div>

            {/* Auto-Save */}
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

            {/* Points Multiplier */}
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

                {enablePointMultiplier && (
                    <PointsMultiplier
                        calculatedPoints={calculatedPoints}
                        setCalculatedPoints={setCalculatedPoints}
                    />
                )}
            </div>
        </div>
    );
}
