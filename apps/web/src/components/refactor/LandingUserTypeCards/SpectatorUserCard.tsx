'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { motion } from 'framer-motion';
import { RiSpyLine } from 'react-icons/ri';

export default function SpectatorUserCard() {
    return (
        <PerspectiveCard className="relative w-full h-80 bg-amber-200/95 rounded-l-2xl overflow-hidden flex items-center justify-center group shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[80%] h-60 bg-white rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-neutral-200 flex items-center justify-center overflow-hidden"
            >
                <div
                    className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                    }}
                />

                <div className="relative size-32 flex items-center justify-center">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: [0, 0.2, 0], scale: [0.5, 2] }}
                            transition={{ repeat: Infinity, duration: 6, delay: i * 3.2 }}
                            className="absolute inset-0 border border-neutral-900 rounded-full"
                        />
                    ))}

                    <div className="relative z-10 size-12 bg-neutral-900 rounded-full flex items-center justify-center shadow-2xl">
                        <RiSpyLine className="text-white size-5" />
                    </div>
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="h-1 w-8 bg-neutral-900 rounded-full" />
                    <div className="h-1 w-4 bg-neutral-200 rounded-full" />
                </div>
            </motion.div>
        </PerspectiveCard>
    );
}
