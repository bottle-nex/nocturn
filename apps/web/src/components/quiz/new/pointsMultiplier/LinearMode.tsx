import { Input } from "@/components/ui/input";

interface LinearModeProps {
    inputPointMultiplier: string;
    calculatedPoints: number[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LinearMode({ inputPointMultiplier, calculatedPoints, onChange }: LinearModeProps) {
    return (
        <div className="flex flex-col space-y-3 mt-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Multiplier — points increase evenly per question
            </span>
            <Input
                min={1}
                step="0.05"
                type="number"
                placeholder="1.25"
                value={inputPointMultiplier}
                onChange={onChange}
                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {calculatedPoints.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {calculatedPoints.map((pts, i) => (
                        <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium"
                        >
                            Q{i + 1}: {pts}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}