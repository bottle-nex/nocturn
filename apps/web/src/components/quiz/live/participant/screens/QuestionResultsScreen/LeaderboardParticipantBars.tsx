'use client';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useRef } from 'react';

export default function LeaderboardParticipantBar({
    baseHeight,
    color,
    nickname,
    avatar,
    score,
    rank,
    you,
}: {
    baseHeight: number;
    color: string;
    nickname: string;
    avatar: string;
    score: number;
    rank: number;
    you: boolean;
}) {
    const barRef = useRef<HTMLDivElement>(null);

    const crownColors: Record<number, string> = {
        1: '#FFD700',
        2: '#C0C0C0',
        3: '#CD7F32',
    };

    const responsiveHeight = Math.max(baseHeight * 0.6, 30);

    return (
        <div className="flex flex-col items-center gap-y-1 sm:gap-y-2 relative flex-shrink-0 h-full justify-end">
            <ToolTipComponent content={`Score: ${score}`}>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                    {rank <= 3 && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill={crownColors[rank]}
                            className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-[300] ${
                                rank === 1 ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'
                            } rotate-12 drop-shadow-md`}
                        >
                            <path d="M5 16l-3-9 6 4 4-7 4 7 6-4-3 9H5zm0 2h14v2H5v-2z" />
                        </svg>
                    )}
                    <Image
                        src={avatar}
                        alt={nickname}
                        crossOrigin="anonymous"
                        className={cn(
                            'w-full h-full object-cover rounded-full z-[200]',
                            rank === 1
                                ? 'border-2 sm:border-4 border-[#FFD700]'
                                : rank === 2
                                  ? 'border-2 sm:border-4 border-[#C0C0C0]'
                                  : rank === 3
                                    ? 'border-2 sm:border-4 border-[#CD7F32]'
                                    : 'border-none',
                        )}
                        width={60}
                        height={60}
                    />
                </div>
            </ToolTipComponent>

            <div
                ref={barRef}
                className="rounded-t-md flex justify-center items-center w-12 sm:w-16 lg:w-18 transition-all duration-500 ease-in-out relative"
                style={{
                    backgroundColor: color,
                    height:
                        typeof window !== 'undefined' && window.innerWidth < 640
                            ? responsiveHeight
                            : baseHeight,
                    marginBottom: 0,
                }}
            >
                <div className="absolute top-[1px] left-[1px] w-[3px] sm:w-[5px] h-full z-10 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-b from-white/30 via-white/20 to-transparent rounded-full blur-[1px]" />
                </div>

                <div className="absolute top-[1px] left-1 pr-1 sm:pr-2 w-full h-[4px] sm:h-[6px] z-20 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-t-md blur-[1.5px]" />
                </div>

                <div className="absolute bottom-2 sm:bottom-3 text-neutral-900 font-bold drop-shadow-2xl tracking-wide text-xs sm:text-sm">
                    #{rank}
                </div>

                {you && (
                    <div className="absolute -bottom-1.5 sm:-bottom-2 flex justify-center items-center text-[10px] sm:text-[12px] bg-neutral-300 text-black px-1.5 sm:px-2 py-0.5 rounded-sm shadow-md border border-neutral-600 z-30">
                        You
                    </div>
                )}

                <div className="-rotate-90 z-[20] text-black drop-shadow-2xl tracking-wide text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[100px]">
                    {nickname.split(' ')[0]}
                </div>
            </div>
        </div>
    );
}
