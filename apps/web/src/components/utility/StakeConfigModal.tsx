'use client';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { GoPlus } from 'react-icons/go';
import { HiMiniMinusSmall } from 'react-icons/hi2';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import OpacityBackground from '@/components/utility/OpacityBackground';
import UtilityCard from '@/components/utility/UtilityCard';
import { AnimatePresence, motion } from 'motion/react';
import axios from 'axios';
import { SET_PRIZE_DISTRIBUTION_URL } from 'routes/api_routes';
import { toast } from '@/lib/toast';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import SolanaAction from '@/lib/solana/SolanaAction';

const DEFAULT_DISTRIBUTIONS: Record<number, number[]> = {
    1: [100],
    2: [60, 40],
    3: [50, 30, 20],
    4: [40, 30, 20, 10],
    5: [35, 25, 20, 12, 8],
};

function PrizeDistributionHeader({
    prizePool,
    winnerCount,
    handleWinnerCountChange,
    onPrizePoolChange,
}: {
    prizePool: number;
    winnerCount: number;
    handleWinnerCountChange: (n: number) => void;
    onPrizePoolChange: (value: number) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Total Stake
                    </span>
                    <ToolTipComponent content="Total USDC amount to be staked as the quiz prize pool. This will be distributed among winners based on their rank.">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-white/40">
                    enter the total prize pool amount in USDC
                </div>

                <div className="relative">
                    <Input
                        type="number"
                        value={prizePool}
                        min={0}
                        onChange={(e) => onPrizePoolChange(parseFloat(e.target.value) || 0)}
                        className="h-30 text-5xl! font-semibold dark:text-light-base! text-gray-900! px-5! dark:bg-dark-base! bg-gray-100! border-none rounded-xl ring-1 dark:ring-white/5 ring-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-x-1 dark:ring-white/10 ring-gray-200 ring-1 dark:bg-dark-faded bg-white rounded-xl p-1.5 px-2.5">
                        <Image src={'/icons/usdc.png'} alt="usdc-logo" width={18} height={18} />
                        <span className="font-semibold dark:text-light-base text-gray-700 uppercase text-[13px]">
                            usdc
                        </span>
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Winners
                    </span>
                    <ToolTipComponent content="Number of top-ranked participants who will receive a share of the prize pool. Max 20 winners allowed.">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-white/40">
                    choose between 1 and 20 winners
                </div>

                <div className="flex gap-2 relative">
                    <Input
                        value={winnerCount}
                        onChange={(e) => handleWinnerCountChange(Number(e.target.value))}
                        className="h-12 dark:bg-dark-base! bg-gray-100! border-none px-5! rounded-xl dark:text-light-base text-gray-900 ring-1 dark:ring-white/5 ring-transparent"
                    />
                    <div className="absolute right-3 flex gap-x-1.5 top-1/2 -translate-y-1/2">
                        <Button
                            onClick={() => handleWinnerCountChange(winnerCount - 1)}
                            disabled={winnerCount <= 1}
                            className="w-7 h-7 rounded-md flex justify-center items-center shrink-0 dark:bg-dark-faded bg-white hover:dark:bg-dark-faded/80 hover:bg-gray-50 dark:text-light-base/50 text-gray-500 shadow-xs! shadow-black/5! disabled:opacity-30"
                        >
                            <HiMiniMinusSmall className="size-4 dark:text-light-base/80 text-gray-600" />
                        </Button>
                        <Button
                            onClick={() => handleWinnerCountChange(winnerCount + 1)}
                            disabled={winnerCount >= 20}
                            className="w-7 h-7 rounded-md flex justify-center items-center shrink-0 dark:bg-dark-faded bg-white hover:dark:bg-dark-faded/80 hover:bg-gray-50 dark:text-light-base/50 text-gray-500 shadow-xs! shadow-black/5! disabled:opacity-30"
                        >
                            <GoPlus className="size-4 dark:text-light-base/80 text-gray-600" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PrizeDistributionList({
    percentages,
    handlePercentageChange,
    prizePool,
    totalPercentage,
    isValid,
}: {
    percentages: number[];
    handlePercentageChange: (i: number, v: number) => void;
    prizePool: number;
    totalPercentage: number;
    isValid: boolean;
}) {
    const barColors = ['bg-[#c44536]', 'bg-[#edddd4]', 'bg-[#197278]'];

    return (
        <div className="h-full rounded-xl p-5 px-6 flex flex-col dark:bg-dark-base/30 bg-gray-50 gap-y-5 overflow-hidden border dark:border-white/10 border-gray-200">
            <div className="shrink-0">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Output
                    </span>
                    <ToolTipComponent content="Shows how the total stake will be split among winners based on their rank percentages.">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center gap-x-2 mt-1 text-xs text-neutral-500 dark:text-white/40">
                    computed distribution
                </div>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-5 pr-1">
                {percentages.map((pct, index) => {
                    const rank = index + 1;
                    const barColor = barColors[index] || 'bg-[#a5a5a5]';
                    const amount = (prizePool * pct) / 100;

                    return (
                        <div key={rank} className="flex items-center gap-3">
                            <div className="w-6 text-sm dark:text-light-base/40 text-gray-400 text-center shrink-0">
                                {rank}
                            </div>

                            <div className="flex-1 relative">
                                <div className="h-6 rounded-lg dark:bg-white/5 bg-gray-200/60 dark:border-white/10 border border-gray-200 overflow-hidden">
                                    <div
                                        className={cn('h-full rounded-lg transition-all', barColor)}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                                <Input
                                    type="number"
                                    value={pct}
                                    min={0}
                                    max={100}
                                    onChange={(e) =>
                                        handlePercentageChange(index, parseFloat(e.target.value))
                                    }
                                    className="w-14 h-7 text-center text-sm dark:bg-dark-alpha/60! bg-gray-100! dark:border-white/10! border-gray-200! rounded-lg! dark:text-light-base text-gray-700 tabular-nums px-1!"
                                />
                                <span className="text-xs dark:text-white/40 text-gray-400">%</span>
                            </div>

                            <div className="w-20 text-right text-xs dark:text-white/40 text-gray-400 tabular-nums shrink-0">
                                {amount.toFixed(2)} <span className="text-[10px]">USDC</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="shrink-0 flex items-center justify-between pt-2 dark:border-white/10 border-gray-200 border-t">
                <span className="text-xs dark:text-white/40 text-gray-400">
                    Total: {totalPercentage.toFixed(1)}%
                </span>
                {!isValid && <span className="text-xs text-red-400/70">Must equal 100%</span>}
            </div>
        </div>
    );
}

export default function StakeConfigModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { quiz, updateQuiz } = useNewQuizStore();
    const { session } = useUserSessionStore();
    const [winnerCount, setWinnerCount] = useState(3);
    const [percentages, setPercentages] = useState<number[]>([50, 30, 20]);

    const [prizePool, setPrizePool] = useState(quiz.prizePool || 0);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        setPrizePool(quiz.prizePool || 0);
    }, [quiz.prizePool]);

    const handlePrizePoolChange = useCallback(
        (value: number) => {
            setPrizePool(value);
            updateQuiz({ prizePool: value });
        },
        [updateQuiz],
    );

    useEffect(() => {
        if (quiz.prizeDistributions && quiz.prizeDistributions.length > 0) {
            setWinnerCount(quiz.prizeDistributions.length);
            setPercentages(quiz.prizeDistributions.map((d) => d.percentage));
        }
    }, [quiz.prizeDistributions]);

    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
    const isValid = Math.abs(totalPercentage - 100) < 0.01;

    const autoSave = useCallback(
        (pcts: number[]) => {
            const total = pcts.reduce((sum, p) => sum + p, 0);
            if (Math.abs(total - 100) < 0.01) {
                const distributions = pcts.map((p, i) => ({
                    id: '',
                    quizId: '',
                    rank: i + 1,
                    percentage: p,
                }));
                updateQuiz({ prizeDistributions: distributions });
            }
        },
        [updateQuiz],
    );

    const handleWinnerCountChange = (count: number) => {
        const clamped = Math.max(1, Math.min(20, count));
        setWinnerCount(clamped);

        const defaults = DEFAULT_DISTRIBUTIONS[clamped];
        let newPercentages: number[];

        if (defaults) {
            newPercentages = defaults;
        } else {
            const even = Math.floor(100 / clamped);
            const remainder = 100 - even * clamped;
            newPercentages = Array(clamped).fill(even) as number[];
            newPercentages[0] = even + remainder;
        }

        setPercentages(newPercentages);
        autoSave(newPercentages);
    };

    function handlePercentageChange(index: number, value: number) {
        const updated = [...percentages];
        updated[index] = isNaN(value) ? 0 : value;
        setPercentages(updated);
        autoSave(updated);
    }

    async function handleConfirm() {
        if (!quiz.id || !isValid || !session?.user?.token) return;
        setConfirming(true);
        try {
            await SolanaAction.configureDistribution(session.user.token, quiz.id, percentages);
            toast.success('Prize distribution saved');
            onClose();
        } catch {
            toast.error('Failed to save prize distribution');
        } finally {
            setConfirming(false);
        }
    }

    if (prizePool <= 0) return null;

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
                                'w-230 max-h-[80vh] flex flex-col',
                                'dark:bg-dark-alpha! bg-white!',
                                'dark:border-white/10! border-gray-200! border!',
                                'rounded-xl',
                                'p-0 overflow-hidden',
                            )}
                            onClose={onClose}
                        >
                            <section className="w-full h-56 shrink-0 relative">
                                <Image
                                    src={'/images/landing/buttonPressYellow.png'}
                                    alt="sign-in image"
                                    className="object-cover"
                                    fill
                                    unoptimized
                                />
                            </section>
                            <div className="grid grid-cols-[1fr_1fr] flex-1 min-h-0 overflow-hidden">
                                <div className="p-8 flex flex-col min-h-0 overflow-hidden">
                                    <div
                                        className="flex-1 min-h-0 overflow-y-auto space-y-6 custom-scrollbar"
                                        data-lenis-prevent
                                    >
                                        <div>
                                            <div className="text-lg dark:text-white text-neutral-900 font-medium">
                                                Configure Stake
                                            </div>
                                        </div>

                                        <PrizeDistributionHeader
                                            prizePool={prizePool}
                                            winnerCount={winnerCount}
                                            handleWinnerCountChange={handleWinnerCountChange}
                                            onPrizePoolChange={handlePrizePoolChange}
                                        />

                                        <div className="flex flex-col text-[11px] dark:text-light-base/40 text-gray-400 select-none">
                                            <div className="text-[11px] dark:text-light-base/40 text-gray-500 uppercase">
                                                Instructions
                                            </div>
                                            <div className="mt-1">1. Add the amount to stake</div>
                                            <div>
                                                2. Choose the number of winners the amount will be
                                                distributed to.
                                            </div>
                                            <div>
                                                3. Edit the percentage for every rank — keep total
                                                at 100%.
                                            </div>
                                            <div>
                                                4. Once you confirm, changes cannot be reverted.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 pt-4">
                                        <Button
                                            onClick={handleConfirm}
                                            disabled={!isValid || confirming}
                                            className={cn(
                                                'dark:bg-light-base dark:hover:bg-light-base bg-dark-alpha hover:bg-neutral-800',
                                                'active:scale-[0.98] cursor-pointer',
                                                'w-full dark:text-dark-base text-white py-5.5 rounded-xl!',
                                                'inset-shadow-xs inset-shadow-white/30 ring-1 ring-dark-alpha',
                                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                            )}
                                        >
                                            {confirming ? 'Saving...' : 'Confirm Distribution'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="p-6 min-h-0 overflow-hidden">
                                    <PrizeDistributionList
                                        percentages={percentages}
                                        handlePercentageChange={handlePercentageChange}
                                        prizePool={prizePool}
                                        totalPercentage={totalPercentage}
                                        isValid={isValid}
                                    />
                                </div>
                            </div>
                        </UtilityCard>
                    </motion.div>
                </OpacityBackground>
            )}
        </AnimatePresence>
    );
}
