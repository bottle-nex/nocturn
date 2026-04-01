import { cn } from '@/lib/utils';
import { useState } from 'react';

let styleInjected = false;
const injectShakeStyle = () => {
    if (typeof window !== 'undefined' && !styleInjected) {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shaky-error {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-5px); }
                40% { transform: translateX(5px); }
                60% { transform: translateX(-3px); }
                80% { transform: translateX(3px); }
            }
        `;
        document.head.appendChild(style);
        styleInjected = true;
    }
};

interface ColoredInputProps {
    className?: string;
    value: string;
    color?: string;
    onChange: (val: string) => void;
}

export default function ColoredInput({ className, value, color, onChange }: ColoredInputProps) {
    const [isShaking, setIsShaking] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleBlur = () => {
        if (!value || value.trim() === '') {
            injectShakeStyle();
            setHasError(true);
            setIsShaking(true);
            setTimeout(() => {
                setIsShaking(false);
            }, 400);
        }
    };

    const handleChange = (val: string) => {
        if (hasError && val.trim() !== '') {
            setHasError(false);
        }
        onChange(val);
    };

    return (
        <div
            className={cn(
                'w-full flex justify-start items-center gap-x-2 bg-neutral-200 dark:bg-dark-base',
                'file:text-foreground placeholder:text-muted-foreground selection:bg-alpha selection:text-alpha-foreground border-none flex w-full min-w-0 rounded-md border px-4 py-2.5 text-base shadow-xs transition-[color,box-shadow,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                hasError && 'ring-1 ring-red-500! border-red-500! text-red-500 dark:text-red-400',
                className,
            )}
            style={isShaking ? { animation: 'shaky-error 0.4s ease-in-out' } : undefined}
        >
            <div
                className="w-5 h-5 rounded-full aspect-square border border-neutral-300 dark:border-neutral-700"
                style={{ background: color }}
            />
            <input
                aria-label="Option"
                className={cn(
                    'outline-none h-full w-full bg-transparent text-dark-base dark:text-light-base dark:placeholder:text-light-base placeholder:text-dark-base',
                    hasError &&
                        'placeholder:text-red-500/60 dark:placeholder:text-red-400/60 text-red-500 dark:text-red-400',
                )}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
            />
        </div>
    );
}
