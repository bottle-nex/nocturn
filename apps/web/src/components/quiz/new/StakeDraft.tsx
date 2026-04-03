'use client';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { RxCross2 } from 'react-icons/rx';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import StakeAmountSection from '@/components/utility/StakeAmountSection';
import ShowWalletInfo from '@/components/utility/ShowWalletInfo';
import { useEffect, useState } from 'react';
import StakeConfigModal from '@/components/utility/StakeConfigModal';
import StakeConfirmButton from '@/components/quiz/new/StakeConfirmButton';

export default function StakeDraft() {
    const { setState } = useDraftRendererStore();
    const [openConfig, setOpenConfig] = useState<boolean>(false);

    const openModal = () => setOpenConfig(true);
    const closeModal = () => setOpenConfig(false);

    useEffect(() => {
        function handleConfigClose(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
            }
        }
        window.addEventListener('keydown', handleConfigClose);
        return () => window.removeEventListener('keydown', handleConfigClose);
    }, []);

    return (
        <div className="text-neutral-900 dark:text-neutral-100 flex flex-col gap-y-4 select-none">
            <div className="w-full flex items-center justify-between border-b border-neutral-300 dark:border-neutral-700 pb-2">
                <div className="text-lg font-medium">Stake</div>
                <RxCross2 onClick={() => setState(DraftRenderer.NONE)} className="cursor-pointer" />
            </div>

            <div className="w-full px-2">
                <div className="flex items-center gap-x-1 mt-2">
                    <span className="text-sm text-dark-alpha dark:text-light-base">
                        Wallet Credentials
                    </span>
                    <ToolTipComponent content="See your wallet credentials here">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 block">
                    Your wallet credentials
                </span>
                <ShowWalletInfo />
            </div>

            <StakeAmountSection onConfigure={openModal} />
            <StakeConfirmButton />
            <StakeConfigModal open={openConfig} onClose={closeModal} />
        </div>
    );
}
