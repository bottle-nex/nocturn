'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { motion } from 'framer-motion';

export default function ParticipantUserCard() {
    return (
        <PerspectiveCard className="relative w-full h-80 bg-sky-100 rounded-r-2xl overflow-hidden flex items-center justify-center group shadow-sm">
            <div className="relative w-3/4 h-3/4 bg-white rounded-xl shadow-xl overflow-hidden border border-neutral-100">
                <div className="absolute top-0 left-0 w-full h-full bg-sky-400/90" />

                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/4 left-1/4 z-10"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-pink-500 drop-shadow-md"
                    >
                        <path d="M5.65 19L3 3L19 11.35L11.85 13.15L5.65 19Z" fill="currentColor" />
                    </svg>
                    <div className="ml-4 -mt-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm shadow-lg uppercase tracking-wider">
                        Thomas
                    </div>
                </motion.div>

                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-1/3 right-1/4 z-10"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-yellow-400 drop-shadow-md"
                    >
                        <path d="M5.65 19L3 3L19 11.35L11.85 13.15L5.65 19Z" fill="currentColor" />
                    </svg>
                    <div className="ml-4 -mt-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-sm shadow-lg uppercase tracking-wider">
                        Louisa
                    </div>
                </motion.div>
            </div>
        </PerspectiveCard>
    );
}
