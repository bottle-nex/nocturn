import { Input } from '@/components/ui/input';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

export default function StakeAmountSection() {
    return (
        <div className="w-full px-2 mt-6 space-y-2">
            <div className="flex flex-col gap-x-1">
                <div className="flex items-center gap-x-1">
                    <span className="text-sm font-normal text-dark-prime dark:text-light-base">
                        Stake Amount
                    </span>
                    <ToolTipComponent content="Amount of SOL to be staked as quiz reward.">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Minimum stake: 0.1 SOL · Maximum: 100 SOL
                </p>
            </div>

            <Input
                type="number"
                placeholder="e.g. 2.5"
                min={0.1}
                step={0.1}
                className="mt-4 placeholder:font-mono placeholder:text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
        </div>
    );
}
