import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FiMinus, FiPlus } from "react-icons/fi";

interface SteppedModeProps {
    steppedIncrement: number;
    calculatedPoints: number[];
    batchSize: number;
    onIncrementChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBatchSizeChange: (size: number) => void;
}

export function SteppedMode({ steppedIncrement, calculatedPoints, batchSize, onIncrementChange, onBatchSizeChange }: SteppedModeProps) {
    return (
        <div className="flex flex-col space-y-3 mt-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Increase points in batches, instead of individually
            </span>
            <Input
                min={1}
                step="1"
                type="number"
                placeholder="10"
                value={steppedIncrement}
                onChange={onIncrementChange}
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            {/* Batch Size Control */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    Batch size
                </span>
                <div className="flex items-center gap-x-2">
                    <button
                        onClick={() => onBatchSizeChange(batchSize - 1)}
                        disabled={batchSize <= 1}
                        className={cn(
                            'p-1 rounded-md border transition-all duration-150',
                            'border-neutral-300 dark:border-neutral-700',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                            'disabled:opacity-30 disabled:cursor-not-allowed',
                            'cursor-pointer',
                        )}
                    >
                        <FiMinus size={12} />
                    </button>
                    <span className="text-sm font-medium w-6 text-center tabular-nums">
                        {batchSize}
                    </span>
                    <button
                        onClick={() => onBatchSizeChange(batchSize + 1)}
                        disabled={batchSize >= 15}
                        className={cn(
                            'p-1 rounded-md border transition-all duration-150',
                            'border-neutral-300 dark:border-neutral-700',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                            'disabled:opacity-30 disabled:cursor-not-allowed',
                            'cursor-pointer',
                        )}
                    >
                        <FiPlus size={12} />
                    </button>
                </div>
            </div>

            {calculatedPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {calculatedPoints.map((pts, i) => {
                        const tier = Math.floor(i / batchSize);
                        return (
                            <span
                                key={i}
                                className={cn(
                                    'text-[10px] px-2 py-0.5 rounded-full font-medium',
                                    tier === 0
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                        : tier === 1
                                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
                                )}
                            >
                                Q{i + 1}: {pts}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}