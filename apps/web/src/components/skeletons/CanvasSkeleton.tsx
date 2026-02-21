'use client';
import { cn } from '@/lib/utils';
import { animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function CanvasSkeletonCard() {
    const shineRef = useRef<HTMLDivElement>(null);
    const runningRef = useRef(true);

    useEffect(() => {
        if (!shineRef.current) return;
        runningRef.current = true;

        const runLoop = async () => {
            while (runningRef.current) {
                await animate(
                    shineRef.current!,
                    { left: '210%', top: '210%' },
                    { duration: 1, ease: 'easeInOut' },
                );
                await new Promise((r) => setTimeout(r, 300));
                if (!runningRef.current) break;
                animate(shineRef.current!, { left: '-160%', top: '-160%' }, { duration: 0 });
                await new Promise((r) => setTimeout(r, 100));
            }
        };

        runLoop();
        return () => {
            runningRef.current = false;
        };
    }, []);

    return (
        <div className="flex flex-col">
            <div className="relative w-full aspect-video rounded-[6px] overflow-hidden bg-neutral-200 dark:bg-dark-base">
                <div
                    ref={shineRef}
                    className={cn(
                        'absolute -rotate-45',
                        'bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.12)_40%,rgba(255,255,255,0.22)_50%,rgba(255,255,255,0.12)_60%,transparent_80%)]',
                        // 'dark:bg-[linear-gradient(115deg,transparent_20%,rgba(255,255,255,0.02)_40%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.02)_60%,transparent_70%)]'
                        'dark:bg-linear-to-br dark:from-neutral-800/10 dark:via-neutral-800/5 dark:to-neutral-800/10',
                    )}
                    style={{
                        width: '160%',
                        aspectRatio: '16/9',
                        top: '-160%',
                        left: '-160%',
                    }}
                />
            </div>

            <div className="flex items-center gap-x-2 pt-2">
                <div className="size-8 rounded-full bg-neutral-300 dark:bg-neutral-800/80 animate-pulse animation-duration-[2s]" />

                <div className="space-y-2">
                    <div className="h-3 w-32 bg-neutral-300 dark:bg-neutral-800/80 rounded-sm animate-pulse animation-duration-[2s]" />
                    <div className="h-2 w-20 bg-neutral-300 dark:bg-neutral-800/80 rounded animate-pulse animation-duration-[2s]" />
                </div>
            </div>
        </div>
    );
}
