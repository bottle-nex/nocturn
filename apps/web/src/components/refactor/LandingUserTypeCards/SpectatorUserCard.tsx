'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { motion } from 'framer-motion';

export default function SpectatorUserCard() {
    const bouncySpring = {
        type: 'spring' as const,
        stiffness: 300,
        damping: 12,
    };

    return (
        <PerspectiveCard className="relative w-full h-80 bg-[#B9BCFE] rounded-l-2xl overflow-hidden flex group ">
            <div className="absolute w-full h-full flex">
                <div className="w-full h-full" />
                <div className="h-full w-full bg-[#9798FD]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bouncySpring, delay: 0 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 h-60 w-40 rounded-t-full overflow-hidden flex"
            >
                <div className="h-full w-full bg-[#9798FD]" />
                <div className="h-full w-full bg-[#E1E0FE]" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bouncySpring, delay: 0.15 }}
                className="absolute top-40 left-1/2 -translate-x-1/2 h-60 w-80 overflow-hidden flex"
            >
                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-[#9798FD]" />
                    <div className="h-full w-full bg-[#E1E0FE]" />
                </div>

                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-[#9798FD]" />
                    <div className="h-full w-full bg-[#E1E0FE]" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bouncySpring, delay: 0.3 }}
                className="absolute top-60 left-1/2 -translate-x-1/2 h-60 w-120 overflow-hidden flex"
            >
                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-[#9798FD]" />
                    <div className="h-full w-full bg-[#E1E0FE]" />
                </div>

                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-[#9798FD]" />
                    <div className="h-full w-full bg-[#E1E0FE]" />
                </div>

                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-[#9798FD]" />
                    <div className="h-full w-full bg-[#E1E0FE]" />
                </div>
            </motion.div>
        </PerspectiveCard>
    );
}
