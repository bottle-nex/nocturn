import * as React from 'react';

import { cn } from '@/lib/utils';

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

function Input({
    className,
    type,
    triggerError,
    setTriggerError,
    triggerErrorTime = 400,
    ...props
}: React.ComponentProps<'input'> & {
    triggerError?: boolean,
    setTriggerError?: (value: boolean) => void,
    triggerErrorTime?: number,
}) {
    const [isShaking, setIsShaking] = React.useState(false);

    React.useEffect(() => {
        if (triggerError) {
            injectShakeStyle();
            setIsShaking(true);
            const timer = setTimeout(() => {
                setIsShaking(false);
                setTriggerError?.(false);
            }, triggerErrorTime);
            return () => clearTimeout(timer);
        }
    }, [triggerError, triggerErrorTime]);

    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'file:text-foreground placeholder:text-muted-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                'autofill:shadow-[0_0_0_1000px_transparent_inset]! autofill:[-webkit-text-fill-color:inherit]!',
                isShaking && 'border-red-500! ring-1 ring-red-500! text-red-500 dark:text-red-400',
                className,
            )}
            style={isShaking ? { animation: `shaky-error ${triggerErrorTime}ms ease-in-out` } : undefined}
            {...props}
        />
    );
}

export { Input };
