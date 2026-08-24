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
        <PerspectiveCard className="relative w-full h-80 bg-linear-to-br from-[#c8862a] to-[#5c3c0f] rounded-2xl overflow-hidden flex group ">
            <div className="absolute w-full h-full flex">
                <div className="w-full h-full" />
                <div className="h-full w-full bg-amber-950" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bouncySpring, delay: 0 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 h-60 w-40 rounded-t-full overflow-hidden flex"
            >
                <div className="h-full w-full bg-amber-950" />
                <div className="h-full w-full bg-amber-100/90" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bouncySpring, delay: 0.15 }}
                className="absolute top-40 left-1/2 -translate-x-1/2 h-60 w-80 overflow-hidden flex"
            >
                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-amber-950" />
                    <div className="h-full w-full bg-amber-100/90" />
                </div>

                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-amber-950" />
                    <div className="h-full w-full bg-amber-100/90" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...bouncySpring, delay: 0.3 }}
                className="absolute top-60 left-1/2 -translate-x-1/2 h-60 w-120 overflow-hidden flex"
            >
                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-amber-950" />
                    <div className="h-full w-full bg-amber-100/90" />
                </div>

                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-amber-950" />
                    <div className="h-full w-full bg-amber-100/90" />
                </div>

                <div className="h-full w-full rounded-t-full overflow-hidden flex">
                    <div className="h-full w-full bg-amber-950" />
                    <div className="h-full w-full bg-amber-100/90" />
                </div>
            </motion.div>
        </PerspectiveCard>
    );
}
