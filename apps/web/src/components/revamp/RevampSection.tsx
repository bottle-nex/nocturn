'use client';
import { CgClose } from 'react-icons/cg';
import { useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Input } from '../ui/input';
import { FiArrowUp } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export default function RevampSection() {
    const [expanded, setExpanded] = useState<boolean>(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const tabletX = useSpring(mouseX, { stiffness: 60, damping: 20 });
    const tabletY = useSpring(mouseY, { stiffness: 60, damping: 20 });

    const crossX = useSpring(mouseX, { stiffness: 90, damping: 25 });
    const crossY = useSpring(mouseY, { stiffness: 90, damping: 25 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();

        const x = (e.clientX - rect.left - rect.width / 2) * 0.05;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.05;

        mouseX.set(x);
        mouseY.set(y);
    }

    return (
        <div
            onMouseMove={handleMouseMove}
            className="w-screen h-screen bg-white text-dark-base flex justify-center items-center relative pb-30 overflow-hidden"
        >
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-80">
                <div className="w-260 h-175 overflow-hidden relative flip">
                    <Image src="/illustrations/img.png" alt="" fill className="object-cover" />
                </div>
            </div>

            <div className="flex flex-col max-w-240 items-center text-center gap-y-3 relative">
                <motion.div
                    style={{ x: tabletX, y: tabletY }}
                    className="absolute top-35 -right-25"
                >
                    <div className="w-24 h-20 overflow-hidden relative flip">
                        <Image
                            src="/illustrations/tablet_in.png"
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                </motion.div>

                <motion.div style={{ x: crossX, y: crossY }} className="absolute top-35 -left-25">
                    <div className="w-20 h-20 overflow-hidden relative -rotate-12">
                        <Image
                            src="/illustrations/crosses_in.png"
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                </motion.div>

                <div className="absolute -top-10 -right-8 rotate-90">
                    <div className="w-20 h-20 overflow-hidden relative flip">
                        <Image
                            src="/illustrations/lines_in.png"
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                <div className="absolute top-88 right-[32%]">
                    <div className="w-30 h-15 overflow-hidden relative scale-x-[-1] rotate-8">
                        <Image
                            src="/illustrations/arrow_in.png"
                            alt=""
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 16 }}
                    animate={{ opacity: 1, scale: [0.9, 1.06, 1], y: [16, -6, 0] }}
                    transition={{
                        opacity: { duration: 0.15 },
                        scale: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                        y: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                    }}
                    className="text-[7rem] leading-[0.95] font-bold"
                >
                    Because guessing is expensive.
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 16 }}
                    animate={{ opacity: 1, scale: [0.9, 1.06, 1], y: [16, -6, 0] }}
                    transition={{
                        opacity: { duration: 0.15 },
                        scale: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                        y: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                    }}
                    className="text-3xl"
                >
                    And confidence should probably be earned.
                </motion.div>

                <div className="w-full flex justify-center mt-6 relative">
                    <AnimatePresence mode="wait">
                        {!expanded ? (
                            <motion.button
                                key="join"
                                layoutId="quiz-cta"
                                whileTap={{ scale: 0.95 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 550,
                                    damping: 40,
                                    mass: 0.15,
                                }}
                                onClick={() => setExpanded(true)}
                                className="bg-[#09C92F] text-dark-base text-xl rounded-full h-14 w-40 cursor-pointer shadow-xs hover:scale-103 hover:-translate-y-0.5 transition-all transform duration-300 relative z-10"
                            >
                                Join Quiz
                            </motion.button>
                        ) : (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="flex relative z-10"
                            >
                                <Input
                                    className="border border-dark-base rounded-full h-14 w-80 pr-14 !bg-white"
                                    placeholder="enter code"
                                />

                                <motion.button
                                    layoutId="quiz-cta"
                                    whileTap={{ scale: 0.95 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 550,
                                        damping: 40,
                                        mass: 0.15,
                                    }}
                                    className="bg-[#09C92F] text-dark-base text-xl rounded-full h-10 w-10 absolute flex justify-center items-center right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                                >
                                    <FiArrowUp />
                                </motion.button>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
                                    onClick={() => setExpanded(false)}
                                    className={cn(
                                        'absolute -right-9 top-1/2 -translate-y-1/2',
                                        'h-7 w-7 rounded-full',
                                        'bg-dark-base text-light-base hover:bg-dark-faded shadow-sm',
                                        'flex justify-center items-center cursor-pointer',
                                    )}
                                >
                                    <CgClose />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
