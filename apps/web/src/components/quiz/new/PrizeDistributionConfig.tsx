'use client';

import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { useState, useEffect } from 'react';

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

function getRankColor(rank: number): string {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-neutral-300';
    if (rank === 3) return 'text-amber-600';
    return 'text-neutral-400';
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
    }, []);

    const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
    const isValid = Math.abs(totalPercentage - 100) < 0.01;

    const handleWinnerCountChange = (count: number) => {
        const clamped = Math.max(1, Math.min(20, count));
        setWinnerCount(clamped);

        const defaults = DEFAULT_DISTRIBUTIONS[clamped];
        if (defaults) {
            setPercentages(defaults);
        } else {
            // Distribute evenly for custom counts
            const even = Math.floor(100 / clamped);
            const remainder = 100 - even * clamped;
            const newPercentages = Array(clamped).fill(even) as number[];
            newPercentages[0] = even + remainder;
            setPercentages(newPercentages);
        }
    };

    const handlePercentageChange = (index: number, value: number) => {
        const updated = [...percentages];
        updated[index] = isNaN(value) ? 0 : value;
        setPercentages(updated);
    };

    const handleSave = () => {
        if (!isValid) return;
        const distributions = percentages.map((p, i) => ({
            rank: i + 1,
            percentage: p,
        }));
        updateQuiz({ prizeDistributions: distributions as any });
    };

    const handleSuggest = () => {
        handleWinnerCountChange(winnerCount);
    };

    if (prizePool <= 0) return null;

    return (
        <div className="w-full px-2 mt-6 space-y-3">
            <div className="flex items-center gap-x-1">
                <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                    Prize Distribution
                </span>
                <ToolTipComponent content="Configure how the prize pool is split among top winners.">
                    <AiOutlineQuestionCircle size={15} />
                </ToolTipComponent>
            </div>

            <div className="flex items-center gap-x-2">
                <label className="text-xs text-neutral-500 dark:text-neutral-400">
                    Number of winners:
                </label>
                <Input
                    type="number"
                    min={1}
                    max={20}
                    value={winnerCount}
                    onChange={(e) => handleWinnerCountChange(parseInt(e.target.value))}
                    className="w-16 h-7 text-xs text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSuggest}
                    className="h-7 text-xs px-2"
                >
                    Suggest
                </Button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {percentages.map((pct, index) => (
                    <div key={index} className="flex items-center gap-x-2">
                        <span className={`text-xs font-medium w-8 ${getRankColor(index + 1)}`}>
                            {getRankLabel(index + 1)}
                        </span>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={pct}
                            onChange={(e) =>
                                handlePercentageChange(index, parseFloat(e.target.value))
                            }
                            className="w-16 h-7 text-xs text-center appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">%</span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto font-mono">
                            {((prizePool * pct) / 100).toFixed(4)} SOL
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-neutral-300 dark:border-neutral-700">
                <span
                    className={`text-xs font-medium ${isValid ? 'text-green-500' : 'text-red-400'}`}
                >
                    Total: {totalPercentage.toFixed(1)}%
                </span>
                <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!isValid}
                    className="h-7 text-xs px-3 bg-dark-alpha hover:bg-dark-alpha/90 text-white disabled:opacity-50"
                >
                    Save Distribution
                </Button>
            </div>

            {!isValid && <p className="text-xs text-red-400">Percentages must sum to 100%</p>}
        </div>
    );
}
