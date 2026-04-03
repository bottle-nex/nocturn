'use client';
import { ImStatsBars } from 'react-icons/im';
import { motion } from 'framer-motion';

export default function DifficultyCard() {
    return (
        <motion.div
            initial={{ opacity: 0, rotate: 6, y: 20 }}
            animate={{ opacity: 1, rotate: 6, y: 0 }}
            className="h-72 w-65 shrink-0 rounded-2xl bg-dark-base border border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.4)] mt-40 -mr-6 overflow-hidden flex flex-col p-6 select-none group"
        >
            <div className="absolute top-0 right-0 size-24 bg-[#FF3200]/10 blur-[50px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6 z-10">
                <div className="size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <ImStatsBars className="size-4 text-[#ff4c1f]" />
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 tracking-widest uppercase">
                    LEVEL_SYNC
                </div>
            </div>

            <div className="mb-4 z-10">
                <div className="text-white text-[18px] font-black tracking-tighter leading-none mb-1">
                    Difficulty
                </div>
                <div className="text-white/40 text-[11px] font-medium leading-tight">
                    Scale the challenge to <br />
                    <span className="text-[#FF3200]/80 italic font-semibold">
                        maximize your rewards.
                    </span>
                </div>
            </div>

            <div className="relative flex-1 flex flex-col justify-center gap-4 z-10">
                <div className="flex items-end justify-between h-12 gap-1.5 px-1">
                    {[0.3, 0.5, 1.0, 0.6, 0.4].map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h * 100}%` }}
                            className={`w-full rounded-t-sm transition-all duration-500 ${i === 2 ? 'bg-[#FF3200] shadow-[0_0_20px_rgba(255,50,0,0.5)]' : 'bg-white/10'}`}
                        />
                    ))}
                </div>

                <div className="h-11 bg-white/5 border border-white/10 rounded-lg p-1 flex gap-1">
                    <div className="flex-1 flex items-center justify-center text-[9px] font-semibold tracking-wider text-white/20">
                        EASY
                    </div>
                    <div className="flex-1 bg-[#ff4213] rounded-md flex items-center justify-center text-[10px] text-white shadow-[0_0_15px_rgba(255,50,0,0.3)] uppercase tracking-wider font-semibold">
                        Medium
                    </div>
                    <div className="flex-1 flex items-center justify-center text-[9px] font-semibold tracking-wider text-white/20">
                        HARD
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
