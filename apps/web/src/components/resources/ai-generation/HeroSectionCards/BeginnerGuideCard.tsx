'use client';
import { Check, Circle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { GiBlackBook } from 'react-icons/gi';

export default function BeginnerGuideCard() {
    return (
        <motion.div
            initial={{ opacity: 0, rotate: 0, y: 20 }}
            animate={{ opacity: 1, rotate: 2, y: 0 }}
            whileHover={{ scale: 1.08, y: -15, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="h-72 w-65 shrink-0 rounded-2xl bg-[#004D40] border border-white/5 shadow-[0_25px_50px_rgba(0,0,0,0.3)] rotate-2 mt-30 -mr-6 overflow-hidden flex flex-col p-6 select-none group cursor-pointer"
        >
            <div className="absolute top-0 right-0 size-32 bg-emerald-400/5 blur-[35px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
                className="flex items-center justify-between mb-5 z-10"
            >
                <div className="size-9 rounded-md bg-white/5 backdrop-blur-sm border border-white/5 flex items-center justify-center">
                    <GiBlackBook className="size-5 text-emerald-300/80" />
                </div>
                <div className="px-2.5 py-0.5 rounded-sm bg-white/5 border border-white/5 text-[9px] font-bold text-emerald-300/50 tracking-widest uppercase">
                    Easy flow
                </div>
            </motion.div>

            <div className="flex-1 space-y-3 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
                >
                    <div className="text-white text-[19px] font-black tracking-tight leading-none mb-1">
                        Start Guide
                    </div>
                    <p className="text-emerald-100/40 text-[11px] font-medium leading-tight">
                        Follow the sequence to <br />
                        <span className="text-emerald-300/70">launch your first session.</span>
                    </p>
                </motion.div>

                <div className="space-y-2.5 pt-1">
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45, duration: 0.3, ease: 'easeOut' }}
                        className="flex items-center gap-3"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                delay: 0.55,
                                duration: 0.25,
                                type: 'spring',
                                stiffness: 400,
                                damping: 15,
                            }}
                            className="size-4 rounded-full bg-emerald-400 flex items-center justify-center shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                        >
                            <Check className="size-2.5 text-[#004D40] stroke-[4px]" />
                        </motion.div>
                        <div className="text-[11px] font-bold text-white/90">Create Quiz</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.65, duration: 0.3, ease: 'easeOut' }}
                        className="flex items-center gap-2 relative"
                    >
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.6, duration: 0.2, ease: 'easeOut' }}
                            style={{ transformOrigin: 'top' }}
                            className="absolute -top-2.5 left-2 w-[1.5px] h-2.5 bg-emerald-400/20"
                        />

                        <div className="size-4 rounded-full border-2 border-emerald-400 flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.75, duration: 0.3, ease: 'easeOut' }}
                                className="size-1.5 rounded-full bg-emerald-400"
                            />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0.8 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 0.7, duration: 0.25, ease: 'easeOut' }}
                            style={{ transformOrigin: 'left' }}
                            className="flex-1 bg-white/5 rounded-lg px-2.5 py-0.5 border border-white/5"
                        >
                            <div className="text-[11px] text-light-base uppercase tracking-wide">
                                Choose difficulty
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 0.25, x: 0 }}
                        transition={{ delay: 0.85, duration: 0.3, ease: 'easeOut' }}
                        className="flex items-center gap-3 relative"
                    >
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.8, duration: 0.2, ease: 'easeOut' }}
                            style={{ transformOrigin: 'top' }}
                            className="absolute -top-2.5 left-2 w-[1.5px] h-2.5 bg-emerald-400/20"
                        />
                        <Circle className="size-4 text-white" />
                        <div className="text-[11px] font-medium text-white/80">Edit features</div>
                    </motion.div>
                </div>
            </div>

            <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.3, ease: 'easeOut' }}
                className="mt-0 w-full h-8 bg-white hover:bg-emerald-50 text-[#004D40] rounded-md font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-black/10 "
            >
                Begin Setup <Play className="size-3 fill-current" />
            </motion.button>
        </motion.div>
    );
}
