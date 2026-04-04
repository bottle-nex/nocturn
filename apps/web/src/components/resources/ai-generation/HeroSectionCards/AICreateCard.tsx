'use client';
import { Mic, SendHorizonal } from 'lucide-react';
import { motion } from 'framer-motion';
import { LuBrain } from 'react-icons/lu';

function VoiceWaveform() {
    return (
        <div className="flex items-center gap-0.5 h-4">
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
                    className="w-0.5 bg-white/40 rounded-full"
                />
            ))}
        </div>
    );
}

export default function AICreateCard() {
    return (
        <motion.div
            initial={{ opacity: 0, rotate: 0, y: 20 }}
            animate={{ opacity: 1, rotate: -6, y: 0 }}
            whileHover={{ scale: 1.08, y: -15, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            className="h-72 w-65 shrink-0 rounded-2xl flex flex-col overflow-hidden shadow-[0_35px_70px_rgba(0,73,138,0.2)] bg-[#00498A] mt-35 -mr-6 select-none border border-white/10 cursor-pointer"
        >
            <div className="pt-6 px-6 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
                    className="flex items-center justify-between mb-4"
                >
                    <div className="size-10 rounded-lg bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                        <LuBrain className="size-5 text-white" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }}
                        className="px-3 py-1 rounded-full bg-white/5 border border-white/10"
                    >
                        <VoiceWaveform />
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
                    className="space-y-1"
                >
                    <h3 className="text-white text-[19px] font-black tracking-tight leading-none">
                        AI Create
                    </h3>
                    <p className="text-white/50 text-[11px] font-medium leading-tight">
                        Generate via <span className="text-white/90">voice patterns</span> or <br />
                        text-based directives.
                    </p>
                </motion.div>
            </div>

            <div className="flex-1 px-4 flex flex-col gap-3">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, x: -8 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.35, ease: 'easeOut' }}
                    className="bg-white rounded-lg rounded-tl-none p-4 shadow-xl border border-white/20 relative group"
                >
                    <div className="space-y-1.5">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.65, duration: 0.25, ease: 'easeOut' }}
                            style={{ transformOrigin: 'left' }}
                            className="h-1.5 w-12 bg-[#00498A]/20 rounded-full"
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.3, ease: 'easeOut' }}
                            className="text-[10px] font-bold text-[#00498A] leading-[1.3]"
                        >
                            Ready. Processing blockchain quiz architecture...
                        </motion.div>
                    </div>
                    <div className="absolute -bottom-2 -left-2 size-2 bg-white rotate-45" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.3, ease: 'easeOut' }}
                    className="mt-auto mb-5 h-10 bg-black/20 backdrop-blur-xl rounded-lg border border-white/10 flex items-center px-3 gap-3"
                >
                    <div className="size-6 rounded-full bg-white/10 flex items-center justify-center">
                        <Mic className="size-3 text-white/60" />
                    </div>
                    <div className="h-1.5 flex-1 bg-white/10 rounded-full" />
                    <SendHorizonal className="size-3 text-white/40" />
                </motion.div>
            </div>

            <div className="absolute inset-0 pointer-events-none bg-linear-to-br from-white/10 via-transparent to-black/20" />
        </motion.div>
    );
}
