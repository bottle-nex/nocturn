import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { RxCross2 } from 'react-icons/rx';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import StakeAmountSection from '@/components/utility/StakeAmountSection';
import ShowWalletInfo from '@/components/utility/ShowWalletInfo';
import PrizeDistributionConfig from './PrizeDistributionConfig';

export default function StakeDraft() {
    const { setState } = useDraftRendererStore();

    return (
        <div className="text-neutral-900 dark:text-neutral-100 flex flex-col justify-start items-start gap-y-4 select-none">
            <div className="w-full flex items-center justify-between border-b border-neutral-300 dark:border-neutral-700 pb-2">
                <div className="text-lg font-medium">Stake</div>
                <RxCross2 onClick={() => setState(DraftRenderer.NONE)} className="cursor-pointer" />
            </div>

            <div className="w-full px-2">
                <div className="flex items-center justify-start gap-x-1 mt-2">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Wallet Credentials
                    </span>
                    <ToolTipComponent content="See your wallet credentials here">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>

                <div className="flex w-full items-center justify-between mt-1">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Your wallet credentials
                    </span>
                </div>

                <ShowWalletInfo />
            </div>

            <StakeAmountSection />
            <PrizeDistributionConfig />
        </div>
    );
}
