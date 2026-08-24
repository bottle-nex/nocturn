import { cn } from '@/lib/utils';

export default function SectionDivider({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'relative w-full max-w-270 mx-auto h-px bg-linear-to-r from-transparent via-dark-base/12 to-transparent',
                className,
            )}
        >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-dark-base/20" />
        </div>
    );
}
