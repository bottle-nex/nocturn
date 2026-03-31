'use client';

import OpacityBackground from '@/components/utility/OpacityBackground';
import UtilityCard from '@/components/utility/UtilityCard';
import { AnimatePresence, motion } from 'motion/react';
import PrizeDistributionConfig from '../quiz/new/PrizeDistributionConfig';
import StakeConfirmButton from '../quiz/new/StakeConfirmButton';
import { cn } from '@/lib/utils';

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
                        initial={{ opacity: 0, scale: 0.985 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.985 }}
                        transition={{ duration: 0.18 }}
                    >
                        <UtilityCard
                            className={cn(
                                'w-105 max-w-[95vw] h-130',
                                'flex flex-col p-0',
                                'bg-[#0b0f14]/95 backdrop-blur-xl',
                                'border border-neutral-800',
                                'shadow-[0_10px_30px_rgba(0,0,0,0.6)]',
                                'rounded-xl overflow-hidden',
                            )}
                        >
                            <div
                                className={cn(
                                    'px-5 py-4 rounded-xl',
                                    'border-b border-neutral-800',
                                    'bg-neutral-900/40 backdrop-blur-sm',
                                )}
                            >
                                <h2 className="text-sm font-semibold text-neutral-200">
                                    Prize Distribution
                                </h2>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Define how rewards are split
                                </p>
                            </div>

                            <div className="relative flex-1 overflow-hidden">
                                <div
                                    className={cn(
                                        'pointer-events-none absolute top-0 left-0 right-0 h-6 z-10',
                                    )}
                                />

                                <div
                                    className={cn(
                                        'pointer-events-none absolute bottom-0 left-0 right-0 h-6 z-10',
                                        'bg-linear-to-t from-[#0b0f14] to-transparent',
                                    )}
                                />

                                <div
                                    data-lenis-prevent
                                    className="h-full overflow-y-auto px-5 py-4 pr-3 scroll-smooth"
                                >
                                    <PrizeDistributionConfig />
                                </div>
                            </div>

                            <div
                                className={cn(
                                    'px-5 py-4',
                                    'border-t border-neutral-800',
                                    'bg-neutral-900/40 backdrop-blur-sm',
                                )}
                            >
                                <StakeConfirmButton />
                            </div>
                        </UtilityCard>
                    </motion.div>
                </OpacityBackground>
            )}
        </AnimatePresence>
    );
}
