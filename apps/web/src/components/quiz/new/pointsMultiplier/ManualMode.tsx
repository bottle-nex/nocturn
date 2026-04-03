import { Input } from '@/components/ui/input';

interface ManualModeProps {
    questions: { basePoints: number }[];
    manualPoints: number[];
    onPointChange: (index: number, value: number) => void;
}

export function ManualMode({ questions, manualPoints, onPointChange }: ManualModeProps) {
    return (
        <div className="flex flex-col space-y-3 mt-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Set points for each question individually
            </span>
            <div className="flex flex-col gap-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-x-3">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 w-8 shrink-0 font-medium">
                            Q{i + 1}
                        </span>
                        <Input
                            type="number"
                            min={0}
                            value={manualPoints[i] ?? q.basePoints}
                            onChange={(e) => onPointChange(i, Number(e.target.value))}
                            className="h-8 text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
