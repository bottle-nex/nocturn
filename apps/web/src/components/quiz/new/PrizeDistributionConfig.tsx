'use client';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { GoPlus } from 'react-icons/go';
import { HiMiniMinusSmall } from 'react-icons/hi2';

const DEFAULT_DISTRIBUTIONS: Record<number, number[]> = {
    1: [100],
    2: [60, 40],
    3: [50, 30, 20],
    4: [40, 30, 20, 10],
    5: [35, 25, 20, 12, 8],
};

// function getRankLabel(rank: number): string {
//     if (rank === 1) return '1st';
//     if (rank === 2) return '2nd';
//     if (rank === 3) return '3rd';
//     return `${rank}th`;
// }

export function PrizeDistributionHeader({
    prizePool,
    winnerCount,
    handleWinnerCountChange,
}: {
    prizePool: number;
    winnerCount: number;
    handleWinnerCountChange: (n: number) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-[11px] dark:text-light-base/40 text-gray-500">
                    TOTAL STAKE
                </label>

                <div className="relative">
                    <Input
                        value={prizePool}
                        readOnly
                        className="h-30 text-5xl! font-semibold dark:text-light-base! text-gray-900! px-5! dark:bg-[#151E28]! bg-gray-100! border-none rounded-lg"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-x-1 dark:ring-white/10 ring-gray-200 ring-1 dark:bg-[#2a3545] bg-white rounded-full p-1.5 px-2.5">
                        <Image src={'/icons/usdc.png'} alt="usdc-logo" width={18} height={18} />
                        <span className="font-semibold dark:text-light-base text-gray-700 uppercase text-[13px]">
                            usdc
                        </span>
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[11px] dark:text-light-base/40 text-gray-500">WINNERS</label>

                <div className="flex gap-2 relative">
                    <Input
                        value={winnerCount}
                        onChange={(e) => handleWinnerCountChange(Number(e.target.value))}
                        className="h-12 dark:bg-[#151E28]! bg-gray-100! border-none px-5! rounded-lg dark:text-light-base text-gray-900"
                    />
                    <div className="absolute right-3 flex gap-x-1.5 top-1/2 -translate-y-1/2">
                        <Button
                            onClick={() => handleWinnerCountChange(winnerCount - 1)}
                            disabled={winnerCount <= 1}
                            className="w-7 h-7 rounded-sm flex justify-center items-center shrink-0 dark:bg-[#090D10] bg-white hover:dark:bg-[#090D10] hover:bg-gray-50 dark:text-light-base/50 text-gray-500 shadow-xs! shadow-black/5! disabled:opacity-30"
                        >
                            <HiMiniMinusSmall className="size-4 dark:text-light-base/80 text-gray-600" />
                        </Button>
                        <Button
                            onClick={() => handleWinnerCountChange(winnerCount + 1)}
                            disabled={winnerCount >= 20}
                            className="w-7 h-7 rounded-sm flex justify-center items-center shrink-0 dark:bg-[#090D10] bg-white hover:dark:bg-[#090D10] hover:bg-gray-50 dark:text-light-base/50 text-gray-500 shadow-xs! shadow-black/5! disabled:opacity-30"
                        >
                            <GoPlus className="size-4 dark:text-light-base/80 text-gray-600" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PrizeDistributionList({
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
        <div className="h-full rounded-md p-5 px-6 flex flex-col dark:bg-[#151E2850] bg-gray-50 gap-y-5 overflow-hidden border dark:border-transparent border-gray-200">
            <div className="shrink-0">
                <div className="text-lg dark:text-white text-gray-900 font-medium">Output</div>
                <div className="text-xs dark:text-white/40 text-gray-400">
                    Computed distribution
                </div>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto space-y-5 pr-1">
                {percentages.map((pct, index) => {
                    const rank = index + 1;
                    const barColor = barColors[index] || 'bg-[#a5a5a5]';
                    const amount = (prizePool * pct) / 100;

                    return (
                        <div key={rank} className="flex items-center gap-2">
                            <div className="w-6 text-sm dark:text-light-base/40 text-gray-400">
                                {rank}
                            </div>

                            <div className="flex-1 relative">
                                <div className="h-6 rounded-md dark:bg-white/5 bg-gray-200/60 dark:border-white/10 border border-gray-200 overflow-hidden">
                                    <div
                                        className={cn('h-full transition-all', barColor)}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-1">
                                <input
                                    type="number"
                                    value={pct}
                                    min={0}
                                    max={100}
                                    onChange={(e) =>
                                        handlePercentageChange(index, parseFloat(e.target.value))
                                    }
                                    className="w-10 text-right text-sm bg-transparent outline-none dark:text-white/80 text-gray-700 tabular-nums"
                                />
                                <span className="text-xs dark:text-white/40 text-gray-400">%</span>
                            </div>

                            <div className="w-fit text-right text-xs dark:text-white/40 text-gray-400 tabular-nums shrink-0">
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

export default function PrizeDistributionConfig() {
    const { quiz, updateQuiz } = useNewQuizStore();
    const [winnerCount, setWinnerCount] = useState(3);
    const [percentages, setPercentages] = useState<number[]>([50, 30, 20]);

    const prizePool = quiz.prizePool || 0;

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

    const handlePercentageChange = (index: number, value: number) => {
        const updated = [...percentages];
        updated[index] = isNaN(value) ? 0 : value;
        setPercentages(updated);
        autoSave(updated);
    };

    if (prizePool <= 0) return null;

    return (
        <div
            className="grid grid-cols-[1fr_1fr] h-full overflow-hidden"
            style={{ gridTemplateRows: '100%' }}
        >
            <div className="p-8 flex flex-col justify-between min-h-0 overflow-hidden">
                <div className="shrink-0">
                    <div className="text-lg dark:text-white text-gray-900 font-medium">
                        Configure Stake
                    </div>
                    {/* <div className="text-sm dark:text-white/40 text-gray-400">
                        Define pool and reward logic
                    </div> */}
                </div>

                <div className="shrink-0 space-y-6 mt-2">
                    <PrizeDistributionHeader
                        prizePool={prizePool}
                        winnerCount={winnerCount}
                        handleWinnerCountChange={handleWinnerCountChange}
                    />

                    <div className="flex flex-col text-[11px] dark:text-light-base/40 text-gray-400 select-none">
                        <div className="text-[11px] dark:text-light-base/40 text-gray-500 uppercase">
                            Instructions
                        </div>
                        <div className="mt-1">1. Add the amount to stake</div>
                        <div>
                            2. Choose the number of winners the amount will be distributed to.
                        </div>
                        <div>3. Edit the percentage for every rank — keep total at 100%.</div>
                        <div>4. Once you confirm, changes cannot be reverted.</div>
                    </div>

                    <Button
                        className={cn(
                            'dark:bg-light-base dark:hover:bg-light-base bg-gray-900 hover:bg-gray-800',
                            'active:scale-[0.98] cursor-pointer',
                            'w-full dark:text-dark-base text-white mt-3',
                        )}
                    >
                        Confirm Configuration
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
    );
}
