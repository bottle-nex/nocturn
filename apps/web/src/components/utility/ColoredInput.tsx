import { cn } from '@/lib/utils';

interface ColoredInputProps {
    className?: string;
    value: string;
    color?: string;
    onChange: (val: string) => void;
}

export default function ColoredInput({ className, value, color, onChange }: ColoredInputProps) {
    return (
        <div
            className={cn(
                'w-full flex justify-start items-center gap-x-2',
                'file:text-foreground placeholder:text-muted-foreground selection:bg-prime selection:text-prime-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-4 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
            )}
        >
            <div
                className="w-5 h-5 rounded-full aspect-square border border-neutral-300 dark:border-neutral-700"
                style={{ background: color }}
            />
            <input
                aria-label="Option"
                className="outline-none h-full w-full bg-transparent text-dark-base dark:text-light-base dark:placeholder:text-light-base placeholder:text-dark-base"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
