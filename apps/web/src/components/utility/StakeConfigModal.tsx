'use client';
import PrizeDistributionConfig from '../quiz/new/PrizeDistributionConfig';

export default function StakeConfigModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    return <PrizeDistributionConfig open={open} onClose={onClose} />;
}
