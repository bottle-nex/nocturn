'use client';
import { Edit3, MousePointer2, Layers, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { TbTemplate } from 'react-icons/tb';

export default function ManualEditCard() {
    return (
        <motion.div
            initial={{ opacity: 0, rotate: 0, x: 20 }}
            animate={{ opacity: 1, rotate: -4, x: 0 }}
            whileHover={{ scale: 1.08, y: -15, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="h-72 w-65 shrink-0 rounded-2xl bg-[#C2410C] border border-white/20 shadow-[0_30px_60px_rgba(194,65,12,0.3)] mt-30 overflow-hidden flex flex-col p-6 select-none cursor-pointer"
        >
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
                className="flex items-center justify-between mb-6"
            >
                <div className="size-9 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Edit3 className="size-4 text-white" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.35, ease: 'easeOut' }}
                className="mb-4"
            >
                <div className="text-white text-[18px] font-black tracking-tight leading-none mb-1">
                    Flexible Edit
                </div>
                <div className="text-white/60 text-[11px] font-medium leading-tight">
                    Refine your questions on a <br />
                    <span className="text-white">limitless digital canvas.</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.35, ease: 'easeOut' }}
                className="relative flex-1 bg-black/20 rounded-xl border border-white/10 p-4 overflow-hidden"
            >
                <div className="space-y-2">
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.6, duration: 0.25, ease: 'easeOut' }}
                        style={{ transformOrigin: 'left' }}
                        className="h-1.5 w-20 bg-white/40 rounded-full"
                    />
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.7, duration: 0.25, ease: 'easeOut' }}
                        style={{ transformOrigin: 'left' }}
                        className="h-1.5 w-full bg-white/10 rounded-full"
                    />
                </div>

                <motion.div
                    initial={{ y: 10, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute bottom-2 right-2 bg-white rounded-md p-2 shadow-xl flex items-center gap-2"
                >
                    <div className="size-5 rounded bg-[#C2410C]/10 flex items-center justify-center text-[#C2410C]">
                        <TbTemplate className="size-3" />
                    </div>
                    <div className="flex flex-col pr-1">
                        <span className="text-[7px] font-bold text-black/30 uppercase leading-none">
                            THEME
                        </span>
                        <span className="text-[9px] font-black text-black leading-none">
                            MODERN
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: [0, 30, 10], y: [0, -10, 0] }}
                    transition={{ opacity: { delay: 0.65, duration: 0.3 }, x: { repeat: Infinity, duration: 4, delay: 0.65 }, y: { repeat: Infinity, duration: 4, delay: 0.65 } }}
                    className="absolute top-1/2 left-1/3"
                >
                    <MousePointer2 className="size-4 text-white fill-white drop-shadow-lg" />
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.95, duration: 0.3, ease: 'easeOut' }}
                className="mt-4 flex items-center justify-between"
            >
                <div className="flex gap-2.5 text-white">
                    <Layers className="size-3.5" />
                    <Wand2 className="size-3.5" />
                </div>
                <span className="text-[9px] font-black text-white tracking-widest uppercase">
                    Nocturn AI
                </span>
            </motion.div>
        </motion.div>
    );
}
