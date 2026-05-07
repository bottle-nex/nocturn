'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import { motion } from 'framer-motion';

export default function HostUserGridCard() {
    return (
        <PerspectiveCard className="relative w-full h-80 bg-[#A5EAFC] rounded-2xl overflow-hidden flex items-center justify-center group shadow-sm">
            <motion.div
                animate={{
                    rotate: [-3, 10, 10, -10, -10, 10, 10, -25, -25, -3],
                }}
                transition={{
                    duration: 14,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="h-130 w-130 mt-80 rounded-full aspect-square relative flex justify-center items-center"
            >
                {/* parent circle component */}
                <motion.div className="absolute overflow-hidden w-full h-full flex justify-center items-center -rotate-3 rounded-full bg-[#D7F9FF] -p-25">
                    <div className="h-full w-full"></div>
                    <div className="h-full w-full bg-[#38D2F8]"></div>
                </motion.div>

                {/* child circle component */}
                <motion.div
                    animate={{
                        rotate: [-3, 6, 6, -3, -3, 6, 6, -20, -20, -3],
                    }}
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="h-75 w-75 -rotate-3 rounded-full flex overflow-hidden z-10"
                >
                    <div className="w-full h-full bg-[#38D2F8]"></div>
                    <div className="w-full h-full bg-[#D7F9FF]"></div>
                </motion.div>
            </motion.div>
        </PerspectiveCard>
    );
}
