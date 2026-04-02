import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SteppedModeProps {
    inputPointMultiplier: string;
    calculatedPoints: number[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SteppedMode({ inputPointMultiplier, calculatedPoints, onChange }: SteppedModeProps) {
    return (
        <div className="flex flex-col space-y-3 mt-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Multiplier — points jump in tiers (Q1-3, Q4-6, Q7+)
            </span>
            <Input
                min={1}
                step="0.05"
                type="number"
                placeholder="1.5"
                value={inputPointMultiplier}
                onChange={onChange}
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {calculatedPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {calculatedPoints.map((pts, i) => (
                        <span
                            key={i}
                            className={cn(
                                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                                i <= 2
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                    : i <= 5
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
                            )}
                        >
                            Q{i + 1}: {pts}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}