'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { cn } from '@/lib/utils';
import { IoArrowForward } from 'react-icons/io5';

export default function StakeAmountSection({
    onSubmit,
    onConfigure,
}: {
    onSubmit?: () => void;
    onConfigure?: () => void;
}) {
    const { quiz, updateQuiz } = useNewQuizStore();
    const [triggerError, setTriggerError] = useState<boolean>(false);

    const handleTriggerError = () => {
        setTriggerError(true);
    };

    return (
        <div className="w-full px-2 mt-6">
            <div className="flex items-center justify-start gap-x-1">
                <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                    Stake USDC
                </span>
                <ToolTipComponent content="Amount of USDC to be staked as the quiz prize pool. Winners receive a share based on the distribution config.">
                    <AiOutlineQuestionCircle size={15} />
                </ToolTipComponent>
            </div>
            <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                enter a value between 1 and 10,000 USDC
            </div>

            <div className="w-full relative mt-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        if (!quiz.prizePool || quiz.prizePool < 1 || quiz.prizePool > 10000) {
                            handleTriggerError();
                        } else {
                            onConfigure?.();
                        }
                    }}
                    className="dark:bg-light-base/95! bg-dark-base/90 dark:text-dark-base text-light-base h-8! w-8! rounded-sm! text-[13px]! absolute right-1.5 top-1/2 -translate-y-1/2 z-10"
                >
                    <IoArrowForward />
                </Button>

                <Input
                    triggerError={triggerError}
                    setTriggerError={setTriggerError}
                    triggerErrorTime={400}
                    type="number"
                    placeholder="0.00"
                    value={quiz.prizePool || ''}
                    min={1}
                    max={10000}
                    step={0.01}
                    onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        updateQuiz({ prizePool: isNaN(value) ? 0 : value });
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (!quiz.prizePool || quiz.prizePool < 1 || quiz.prizePool > 10000) {
                                handleTriggerError();
                            } else {
                                onSubmit?.();
                            }
                        }
                    }}
                    className={cn(
                        'w-full h-11 pr-24 text-left text-lg font-semibold tabular-nums dark:bg-dark-alpha/60!',
                        'bg-neutral-300/80! border-none outline-none',
                        'dark:text-neutral-100 text-dark-base/90 placeholder:text-neutral-600',
                        'ring-1 dark:ring-white/5 px-5 shadow-none ring-black/15',
                    )}
                />
            </div>
        </div>
    );
}
