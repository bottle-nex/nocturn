import { cn } from '@/lib/utils';

export default function SectionDivider({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-x-8 w-full max-w-270 mx-auto', className)}>
            <div className="w-40 h-px bg-neutral-600/60 shrink-0" />
            <div className="flex-1 flex flex-col items-center justify-center gap-y-1.5 overflow-hidden">
                {[0, 1].map((row) => (
                    <div key={row} className="flex items-center justify-center gap-x-1.5 w-full">
                        {Array.from({ length: 80 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-0.5 h-0.5 rounded-full bg-neutral-500 shrink-0"
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="w-40 h-px bg-neutral-600/60 shrink-0" />
        </div>
    );
}
