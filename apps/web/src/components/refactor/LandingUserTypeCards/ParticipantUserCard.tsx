'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { motion } from 'framer-motion';

export default function ParticipantUserCard() {
    return (
        <PerspectiveCard className="relative w-full h-80 bg-charlie rounded-2xl flex flex-col overflow-hidden group shadow-sm">
            <motion.div
                animate={{
                    x: ['-100%', '20%', '20%', '-100%', '100%', '27%', '27%', '100%', '-100%'],
                    scaleX: [1, 1, 1, 1, -1, -1, -1, -1, 1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.2, 0.35, 0.499, 0.5, 0.7, 0.85, 0.999, 1],
                }}
                className="h-full w-full flex -ml-30"
            >
                <div className="w-70 bg-dark-alpha" />
                <div className="h-40 w-40 rounded-full -ml-20 bg-beta flex overflow-hidden">
                    <div className="w-full h-full" />
                    <div className="w-full h-full bg-dark-alpha" />
                </div>
            </motion.div>

            <motion.div
                animate={{
                    x: ['100%', '5%', '5%', '100%', '-100%', '-5%', '-5%', '-100%', '100%'],
                    scaleX: [-1, -1, -1, -1, 1, 1, 1, 1, -1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    times: [0, 0.2, 0.35, 0.499, 0.5, 0.7, 0.85, 0.999, 1],
                }}
                className="h-full w-full flex -mr-60"
            >
                <div className="w-70 bg-dark-alpha" />
                <div className="h-40 w-40 rounded-full -ml-20 bg-beta flex overflow-hidden">
                    <div className="w-full h-full" />
                    <div className="w-full h-full bg-dark-alpha" />
                </div>
            </motion.div>
        </PerspectiveCard>
    );
}
