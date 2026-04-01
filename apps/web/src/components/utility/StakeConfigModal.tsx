'use client';
import OpacityBackground from '@/components/utility/OpacityBackground';
import UtilityCard from '@/components/utility/UtilityCard';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import PrizeDistributionConfig from '../quiz/new/PrizeDistributionConfig';

export default function StakeConfigModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    return (
        <AnimatePresence>
            {open && (
                <OpacityBackground onBackgroundClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <UtilityCard
                            className={cn(
                                'w-230 h-130',
                                'dark:bg-[#090D10]! bg-white!',
                                'dark:border-white/10! border-gray-200! border!',
                                'rounded-2xl',
                                'p-0 overflow-hidden',
                            )}
                        >
                            <PrizeDistributionConfig />
                        </UtilityCard>
                    </motion.div>
                </OpacityBackground>
            )}
        </AnimatePresence>
    );
}
