'use client';
import { Check, Circle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { GiBlackBook } from 'react-icons/gi';

export default function BeginnerGuideCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-72 w-65 rounded-2xl bg-[#004D40] border border-white/5 shadow-[0_25px_50px_rgba(0,0,0,0.3)] absolute left-[26%] rotate-2 top-30 overflow-hidden flex flex-col p-6 select-none group"
        >
            <div className="absolute top-0 right-0 size-32 bg-emerald-400/5 blur-[35px] pointer-events-none" />

            <div className="flex items-center justify-between mb-5 z-10">
                <div className="size-9 rounded-md bg-white/5 backdrop-blur-sm border border-white/5 flex items-center justify-center">
                    <GiBlackBook className="size-5 text-emerald-300/80" />
                </div>
                <div className="px-2.5 py-0.5 rounded-sm bg-white/5 border border-white/5 text-[9px] font-bold text-emerald-300/50 tracking-widest uppercase">
                    Easy flow
                </div>
            </div>

            <div className="flex-1 space-y-3 z-10">
                <div>
                    <div className="text-white text-[19px] font-black tracking-tight leading-none mb-1">
                        Start Guide
                    </div>
                    <p className="text-emerald-100/40 text-[11px] font-medium leading-tight">
                        Follow the sequence to <br />
                        <span className="text-emerald-300/70">launch your first session.</span>
                    </p>
                </div>

                <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-3">
                        <div className="size-4 rounded-full bg-emerald-400 flex items-center justify-center shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                            <Check className="size-2.5 text-[#004D40] stroke-[4px]" />
                        </div>
                        <div className="text-[11px] font-bold text-white/90">Create Quiz</div>
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <div className="absolute -top-2.5 left-2 w-[1.5px] h-2.5 bg-emerald-400/20" />

                        <div className="size-4 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2.5 }}
                                className="size-1.5 rounded-full bg-emerald-400"
                            />
                        </div>
                        <div className="flex-1 bg-white/5 rounded-lg px-2.5 py-0.5 border border-white/5">
                            <div className="text-[11px] text-light-base uppercase tracking-wide">
                                Choose difficulty
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 opacity-25 relative">
                        {/* Connecting Line - position adjusted */}
                        <div className="absolute -top-2.5 left-2 w-[1.5px] h-2.5 bg-emerald-400/20" />
                        <Circle className="size-4 text-white" />
                        <div className="text-[11px] font-medium text-white/80">Edit features</div>
                    </div>
                </div>
            </div>

            {/* Button - shadows and colors toned down */}
            <button className="mt-0 w-full h-8 bg-white hover:bg-emerald-50 text-[#004D40] rounded-md font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-black/10 ">
                Begin Setup <Play className="size-3 fill-current" />
            </button>
        </motion.div>
    );
}
