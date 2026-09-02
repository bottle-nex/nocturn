'use client';
import { cn } from '@/lib/utils';
import LandingCardHeader from './LandingCardHeader';
import PerspectiveCard from '@/components/utility/PerspectiveCard';

export default function LandingCreateCardComponent() {
    return (
        <PerspectiveCard className="relative mt-20 w-full max-w-85 xs:max-w-full h-100 rounded-xl bg-[#9896FF] ring-1 ring-white/10 shadow-xs shadow-black/20 overflow-hidden p-6">
            <LandingCardHeader
                title="Create quiz"
                description="Design structured quizzes with intelligent assistance"
            />

            <div className="absolute -bottom-7.5 left-1/2 -translate-x-1/2 w-75 h-75 perspective-[1400px] scale-[0.97]">
                <div
                    className={cn(
                        'relative w-full h-full rounded-xl bg-dark-base',
                        'ring-1 ring-white/10 shadow-xl',
                        'p-5 flex flex-col justify-between',
                        'transition-all duration-500 transform-3d',
                        'rotate-x-12 rotate-y-[8deg]',
                        'hover:rotate-x-0 hover:rotate-y-0 hover:scale-[1.02]',
                    )}
                >
                    <div className="absolute -top-3 left-4 px-2 py-1 text-[10px] rounded-md bg-dark-faded backdrop-blur-sm ring-1 ring-white/10 shadow-sm">
                        AI Generated
                    </div>

                    <div className="text-[11px] text-light-base/40">Blockchain • Intermediate</div>

                    <div className="mt-3 text-[14px] leading-snug text-light-base font-medium">
                        What is the core advantage of sharding in distributed networks?
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                        {[
                            'Improves transaction throughput',
                            'Reduces storage cost',
                            'Enhances encryption',
                            'Eliminates latency',
                        ].map((text, i) => (
                            <Option key={i} index={i} label={text} active={i === 0} />
                        ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-light-base/40 mt-4">
                        <span>4 options</span>
                        <span className="opacity-60">Auto-structured</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-60 h-10 bg-white/5 blur-xl rounded-full opacity-30" />
        </PerspectiveCard>
    );
}

function Option({ label, active, index }: { label: string; active?: boolean; index: number }) {
    const letters = ['A', 'B', 'C', 'D'];

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-[12px] border transition-all duration-200 cursor-pointer',
                'border-white/10 bg-dark-faded text-light-base/70',
                'hover:bg-dark-base hover:text-light-base hover:border-white/20',
                active && 'bg-dark-base text-light-base border-white/20 shadow-sm',
            )}
        >
            {/* 🔤 Option Label */}
            <div
                    className={cn(
                        'h-5 w-5 flex items-center justify-center rounded-md text-[10px] font-medium',
                        'bg-white/5 text-light-base/60',
                        active && 'bg-white text-dark-base',
                    )}
            >
                {letters[index]}
            </div>

            {/* 📄 Text */}
            <span className="leading-none">{label}</span>
        </div>
    );
}
