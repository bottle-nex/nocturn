import { cn } from '@/lib/utils';

interface UnclickableTickerProps {
    children: React.ReactNode;
    className?: string;
}

export default function UnclickableTicker({ children, className }: UnclickableTickerProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-x-2 text-[11px] px-2.5 h-7 rounded-full border border-neutral-200 bg-light-alpha text-dark-alpha/70 shadow-sm  select-none whitespace-nowrap',
                className,
            )}
        >
            {children}
        </span>
    );
}
