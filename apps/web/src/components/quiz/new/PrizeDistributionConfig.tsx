'use client';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { Input } from '@/components/ui/input';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { LuTrophy, LuMinus, LuPlus, LuSparkles } from 'react-icons/lu';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_DISTRIBUTIONS: Record<number, number[]> = {
    1: [100],
    2: [60, 40],
    3: [50, 30, 20],
    4: [40, 30, 20, 10],
    5: [35, 25, 20, 12, 8],
};

function getRankLabel(rank: number): string {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
}

const RANK_STYLES: Record<number, { badge: string; text: string; bar: string }> = {
    1: {
        badge: 'bg-[#facc15]/8 border-[#facc15]/25 text-[#eab308]',
        text: 'text-[#eab308]',
        bar: 'bg-[#eab308]/80',
    },
    2: {
        badge: 'bg-[#94a3b8]/10 border-[#94a3b8]/25 text-[#cbd5f5]',
        text: 'text-[#cbd5f5]',
        bar: 'bg-[#cbd5f5]/70',
    },
    3: {
        badge: 'bg-[#fb923c]/8 border-[#fb923c]/25 text-[#f97316]',
        text: 'text-[#f97316]',
        bar: 'bg-[#f97316]/75',
    },
};

function getRankStyle(rank: number) {
    return (
        RANK_STYLES[rank] ?? {
            badge: 'bg-neutral-200/10 dark:bg-neutral-900 border-neutral-300/20 dark:border-neutral-700/80 text-neutral-500 dark:text-neutral-500',
            text: 'text-neutral-500 dark:text-neutral-500',
            bar: 'bg-neutral-400 dark:bg-neutral-600',
        }
    );
}

export function PrizeDistributionHeader({
    prizePool,
    winnerCount,
    // setWinnerCount,
    handleWinnerCountChange,
}: {
    prizePool: number;
    winnerCount: number;
    // setWinnerCount: (n: number) => void;
    handleWinnerCountChange: (n: number) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <LuTrophy size={14} className="text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-200">Prize Distribution</span>
                    <ToolTipComponent content="Configure how rewards are split">
                        <AiOutlineQuestionCircle size={14} className="text-neutral-500" />
                    </ToolTipComponent>
                </div>
                <span className="text-xs text-neutral-500">{prizePool} USDC</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-900/40 border border-neutral-800">
                <span className="text-xs text-light-base/40">Number of Winners</span>

                <div className="flex items-center gap-x-2">
                    <button
                        onClick={() => handleWinnerCountChange(winnerCount - 1)}
                        disabled={winnerCount <= 1}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-800 hover:bg-neutral-800 transition-colors disabled:opacity-30"
                    >
                        <LuMinus size={14} />
                    </button>

                    <span className="w-6 text-center text-sm font-medium tabular-nums text-neutral-200">
                        {winnerCount}
                    </span>

                    <button
                        onClick={() => handleWinnerCountChange(winnerCount + 1)}
                        disabled={winnerCount >= 20}
                        className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-800 hover:bg-neutral-800 transition-colors disabled:opacity-30"
                    >
                        <LuPlus size={14} />
                    </button>

                    <button
                        onClick={() => handleWinnerCountChange(winnerCount)}
                        className="flex items-center gap-x-1 px-2 h-7 rounded-md border border-neutral-800 text-xs text-neutral-500 hover:bg-neutral-800 transition-colors"
                    >
                        <LuSparkles size={12} />
                        Auto
                    </button>
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
    return (
        <div className="space-y-2">
            {percentages.map((pct, index) => {
                const rank = index + 1;
                const style = getRankStyle(rank);
                const amount = (prizePool * pct) / 100;

                return (
                    <div
                        key={index}
                        className="px-3 py-2 rounded-md border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900/60 transition-colors"
                    >
                        <div className="flex items-center gap-x-3">
                            <span
                                className={cn(
                                    'w-10 h-7 flex items-center justify-center text-xs font-medium border rounded-md',
                                    style.badge,
                                )}
                            >
                                {getRankLabel(rank)}
                            </span>

                            <div className="flex items-center gap-x-1">
                                <Input
                                    type="number"
                                    value={pct}
                                    min={0}
                                    max={100}
                                    onChange={(e) =>
                                        handlePercentageChange(index, parseFloat(e.target.value))
                                    }
                                    className="w-14 h-8 text-sm text-center font-medium tabular-nums border-b border-neutral-700 bg-transparent focus:outline-none"
                                />
                                <span className="text-xs text-neutral-500">%</span>
                            </div>

                            <span className={cn('ml-auto text-sm tabular-nums', style.text)}>
                                {amount.toFixed(2)}
                                <span className="ml-1 text-[11px] text-neutral-500">USDC</span>
                            </span>
                        </div>

                        <div className="mt-2 h-[2px] rounded-full bg-neutral-800">
                            <div
                                className={cn('h-full rounded-full transition-all', style.bar)}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                        </div>
                    </div>
                );
            })}

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                <span className="text-xs text-neutral-500">
                    Total: {totalPercentage.toFixed(1)}%
                </span>

                {!isValid && <span className="text-xs text-neutral-500">Must equal 100%</span>}
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
        <div className="h-full flex flex-col">
            <div className="pb-3">
                <PrizeDistributionHeader
                    prizePool={prizePool}
                    winnerCount={winnerCount}
                    setWinnerCount={setWinnerCount}
                    handleWinnerCountChange={handleWinnerCountChange}
                />
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
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
