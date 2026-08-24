'use client';

import { FaLocationArrow } from 'react-icons/fa';
import { TbCircleDotted } from 'react-icons/tb';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { GoCheckCircle } from 'react-icons/go';

function AnimatedCheckRow() {
    return (
        <motion.div
            className="size-5.5 shrink-0 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <GoCheckCircle className="text-[#39BDB7] size-5.5" />
        </motion.div>
    );
}

function AnimatedDot() {
    return (
        <motion.div
            className="size-5.5 shrink-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        >
            <TbCircleDotted className="size-5.5 text-neutral-400" />
        </motion.div>
    );
}

export default function LiveEditingCardComponent() {
    const [stage, setStage] = useState<number>(0);

    useEffect(() => {
        let t1: ReturnType<typeof setTimeout>;
        let t2: ReturnType<typeof setTimeout>;
        let t3: ReturnType<typeof setTimeout>;

        const run = () => {
            setStage(0);
            t1 = setTimeout(() => setStage(1), 1800);
            t2 = setTimeout(() => setStage(2), 2800);
            t3 = setTimeout(() => run(), 7000);
        };

        run();
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="flex flex-col ring-1 ring-black/10 h-auto sm:h-75 w-full max-w-[440px] rounded-xl overflow-hidden">
            <div className="h-55 bg-linear-to-br from-[#1aa89f] to-[#0b5f5a] relative flex justify-center pt-7 shrink-0">
                <div className="absolute bottom-12 right-31 z-2 -rotate-90">
                    <FaLocationArrow className="text-light-alpha" />
                </div>
                <div className="absolute bottom-6 right-10 h-7 w-22 bg-dark-base z-2 flex items-center justify-center text-sm text-light-base rounded-full">
                    Red John
                </div>
                <div className="h-45 w-70 shadow-xs shadow-black/5 bg-linear-to-b from-light-alpha via-light-alpha/80 to-[#1aa89f] rounded-t-xl absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col py-3">
                    <div className="flex gap-x-3 items-center p-4 px-5">
                        <AnimatePresence mode="wait">
                            {stage >= 1 ? (
                                <motion.div
                                    key="check-1"
                                    className="shrink-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <AnimatedCheckRow />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="dot-1"
                                    className="shrink-0"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <AnimatedDot />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="h-5 w-full bg-neutral-200/40 rounded-full" />
                    </div>

                    <div className="flex gap-x-3 items-center p-4 px-5">
                        <AnimatePresence mode="wait">
                            {stage >= 2 ? (
                                <motion.div
                                    key="check-2"
                                    className="shrink-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <AnimatedCheckRow />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="dot-2"
                                    className="shrink-0"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <AnimatedDot />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="h-5 w-full bg-neutral-200/40 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="h-fit sm:h-20 shrink-0 flex flex-col justify-center px-4 py-2 gap-y-1">
                <div className="text-dark-base/80 text-base">Live Editing</div>
                <div className="text-dark-base/50 text-[13px] leading-[1.1]">
                    Bring collaborators onto any quiz and edit questions together in real time, no
                    version conflicts, no waiting.
                </div>
            </div>
        </div>
    );
}
