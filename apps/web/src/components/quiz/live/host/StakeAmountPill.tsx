'use client';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import Image from 'next/image';

export default function StakeAmountPill() {
    const { gameSession } = useLiveQuizStore();

    return (
        <div
            className={cn(
                'absolute right-3.5 top-1.5 z-50 flex items-center gap-3',
                'rounded-full border border-zinc-800 bg-zinc-950/90 backdrop-blur-md',
                'py-1.5 pl-1.5 pr-4 shadow-lg shadow-black/20',
            )}
        >
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-900 border border-zinc-800/50">
                <Image
                    src={'/icons/usdc.png'}
                    alt="USDC"
                    className="object-contain p-1"
                    fill
                    unoptimized
                />
            </div>

            <div className="flex flex-col items-start justify-center">
                <span className="mb-[2px] text-[9px] font-bold uppercase tracking-widest text-zinc-500 leading-none">
                    Prize Pool
                </span>

                <span className="text-sm font-bold tracking-tight text-zinc-50 leading-none">
                    ${gameSession?.quiz?.prizePool ?? '10.00'}
                </span>
            </div>
        </div>
    );
}
