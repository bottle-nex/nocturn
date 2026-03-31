'use client';
import { Input } from '@/components/ui/input';
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

    return (
        <div className="w-full px-2 mt-6 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-1">
                    <span className="text-sm text-neutral-300 font-medium">Stake USDC</span>
                    <ToolTipComponent content="Amount of USDC to be staked as quiz reward.">
                        <AiOutlineQuestionCircle size={14} className="text-light-base/40 mb-0.5" />
                    </ToolTipComponent>
                </div>

                <span className="text-xs text-neutral-500">Min 1 · Max 10000</span>
            </div>

            <div className="w-full relative">
                <button
                    onClick={onConfigure}
                    className="prem-btn h-8! w-8! rounded-sm! text-[13px]! absolute right-1.5 top-1/2 -translate-y-1/2 flex justify-center items-center"
                >
                    <IoArrowForward className="" />
                </button>

                <Input
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
                        if (e.key === 'Enter' && quiz.prizePool > 0) {
                            onSubmit?.();
                        }
                    }}
                    className={cn(
                        'w-full h-11 pr-24 text-left text-lg font-semibold tabular-nums bg-dark-alpha/60!',
                        'bg-transparent border-none outline-none',
                        'text-neutral-100 placeholder:text-neutral-600',
                        'ring-1 ring-white/[0.05] px-5',
                    )}
                />
            </div>
        </div>
    );
}
