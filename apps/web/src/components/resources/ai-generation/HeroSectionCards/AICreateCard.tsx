'use client';
import { Mic, SendHorizonal } from 'lucide-react';
import { motion } from 'framer-motion';
import { LuBrain } from 'react-icons/lu';

function VoiceWaveform() {
    return (
        <div className="flex items-center gap-[2px] h-4">
            {[1, 3, 2, 4, 2, 3, 1, 4, 3, 2, 4, 2, 1].map((h, i) => (
                <motion.div
                    key={i}
                    animate={{ height: [4, h * 4, 4] }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.05,
                        ease: 'easeInOut',
                    }}
                    className="w-[2px] bg-white/40 rounded-full"
                />
            ))}
        </div>
    );
}

export default function AICreateCard() {
    return (
        <motion.div
            initial={{ opacity: 0, rotate: -6, y: 20 }}
            animate={{ opacity: 1, rotate: -6, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="h-72 w-65 rounded-2xl flex flex-col overflow-hidden shadow-[0_35px_70px_rgba(0,73,138,0.2)] absolute bg-[#00498A] -rotate-2 top-35 select-none border border-white/10"
        >
            <div className="pt-6 px-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-lg bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                        <LuBrain className="size-5 text-white" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <VoiceWaveform />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-white text-[19px] font-black tracking-tight leading-none">
                        AI Create
                    </h3>
                    <p className="text-white/50 text-[11px] font-medium leading-tight">
                        Generate via <span className="text-white/90">voice patterns</span> or <br />
                        text-based directives.
                    </p>
                </div>
            </div>

            <div className="flex-1 px-4 flex flex-col gap-3">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-lg rounded-tl-none p-4 shadow-xl border border-white/20 relative group"
                >
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-12 bg-[#00498A]/20 rounded-full" />
                        <div className="text-[10px] font-bold text-[#00498A] leading-[1.3]">
                            Ready. Processing blockchain quiz architecture...
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -left-2 size-2 bg-white rotate-45" />
                </motion.div>

                <div className="mt-auto mb-5 h-10 bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 flex items-center px-3 gap-3">
                    <div className="size-6 rounded-full bg-white/10 flex items-center justify-center">
                        <Mic className="size-3 text-white/60" />
                    </div>
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full" />
                    <SendHorizonal className="size-3 text-white/40" />
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-black/20" />
        </motion.div>
    );
}
