'use client';

import { FaLightbulb, FaLocationArrow, FaThumbsUp } from 'react-icons/fa6';
import { IoMdHeart } from 'react-icons/io';
import { PiCurrencyCircleDollarFill } from 'react-icons/pi';
import { AnimatePresence, motion, Transition } from 'framer-motion';
import { useState } from 'react';

export default function LandingHeroSection() {
    const [animatingIcons, setAnimatingIcons] = useState<
        { id: number; Icon: React.ElementType; color: string; containerIndex: number }[]
    >([]);

    function createAnimation(Icon: React.ElementType, color: string, containerIndex: number) {
        const newIcon = {
            id: Date.now() + Math.random(),
            Icon,
            color,
            containerIndex,
        };

        setAnimatingIcons((prev) => [...prev, newIcon]);

        setTimeout(() => {
            setAnimatingIcons((prev) => prev.filter((icon) => icon.id !== newIcon.id));
        }, 2200);
    }

    const slowBar = (min: number, max: number, duration = 8, delay = 0) => ({
        animate: {
            height: [min, max, max, min],
        },
        transition: {
            duration,
            ease: [0.4, 0, 0.2, 1],
            repeat: Infinity,
            delay,
            times: [0, 0.4, 0.7, 1],
        } satisfies Transition,
    });

    return (
        <div className="flex flex-col justify-center my-auto pt-15 gap-y-10 items-center h-full min-h-screen w-full relative">
            <div className="flex flex-col max-w-160 text-center select-none">
                <div className="text-[#1b1b1b] text-[75px] font-semibold flex flex-col">
                    Outthink the room
                </div>

                <div className="text-[#1b1b1b]/95 text-[22px] tracking-wide leading-7">
                    A real-time quiz platform powered by Solana. Stake SOL, answer live questions,
                    and earn rewards instantly.
                </div>
            </div>

            {/* bg wave */}
            <div className="absolute inset-0 pointer-events-none">
                <svg
                    viewBox="0 0 1600 400"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M-200 260 C 200 60, 600 460, 1000 240 C 1200 120, 1500 360, 1800 260"
                        stroke="#D4E85C"
                        strokeWidth="3"
                        fill="none"
                    />
                    <path
                        d="M-200 300 C 300 120, 700 480, 1100 260 C 1300 140, 1600 420, 2000 300"
                        stroke="#D4E85C"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                    />
                </svg>
            </div>

            <div className="bg-[#EAEDEB] h-80 w-142 rounded-3xl relative p-8 border-2 border-black noise-bg">
                {/* absolute divs */}
                <div className="absolute top-15 -right-0 -rotate-90 z-10">
                    <FaLocationArrow className="size-7 text-[#0FA655]" />
                </div>

                <div className="bg-[#0FA655] px-4 py-2 absolute top-19 -right-42 z-10 rounded-full text-base tracking-wide flex items-center gap-x-2 hover:-translate-y-0.5 hover:scale-103 transition-all transform duration-200 select-none">
                    Interactive Quizzing
                </div>

                <div className="absolute top-50 -right-10 rotate-200 z-10">
                    <FaLocationArrow className="size-7 text-[#4A8AFE]" />
                </div>

                <div className="bg-[#4A8AFE] px-4 py-2 absolute top-45 -right-52 z-10 rounded-full text-base tracking-wide flex items-center gap-x-2 hover:-translate-y-0.5 hover:scale-103 transition-all transform duration-200 select-none">
                    Live Leaderboards
                </div>

                <div className="absolute top-40 -left-15 z-10">
                    <FaLocationArrow className="size-10 text-[#7A78FE]" />
                </div>

                <div className="bg-[#7a78fe] px-4 py-2 absolute top-47 -left-57 z-10 rounded-full text-base flex items-center gap-x-2 hover:-translate-y-0.5 hover:scale-103 transition-all transform duration-200 select-none">
                    Powered By SOLANA
                </div>

                {/* bars */}
                <div className="h-50 w-full absolute bottom-0 left-0 rounded-b-2xl flex items-end px-10 ">
                    <motion.div
                        {...slowBar(80, 140, 10, 0)}
                        className="h-30 w-full flex flex-col rounded-t-sm overflow-hidden bg-[#4a8afe70] shadow-xs"
                    >
                        <div className="h-8 w-full" />
                        <div className="h-full w-full bg-[#4A8AFE] rounded-t-sm" />
                    </motion.div>

                    <motion.div
                        {...slowBar(120, 200, 12, 1.5)}
                        className="h-50 w-full flex flex-col rounded-t-sm overflow-hidden bg-[#0fa65570] shadow-xs"
                    >
                        <div className="h-8 w-full" />
                        <div className="h-full w-full bg-[#0fa655] rounded-t-sm" />
                    </motion.div>

                    <motion.div
                        {...slowBar(100, 170, 11, 0.8)}
                        className="h-40 w-full flex flex-col rounded-t-sm overflow-hidden bg-[#ffc22170] shadow-xs"
                    >
                        <div className="h-8 w-full" />
                        <div className="h-full w-full bg-[#ffc221] rounded-t-sm" />
                    </motion.div>
                </div>

                {/* intearaction icons */}
                <div className="flex gap-x-2.5 relative z-10 w-full justify-end">
                    <div className="flex gap-x-2.5">
                        <div className="relative w-fit h-fit overflow-visible">
                            <div
                                onClick={() => createAnimation(FaThumbsUp, '#7A78FE', 0)}
                                className="bg-[#7a78fe30] border border-[#7a78fe] text-black h-9 w-9 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                            >
                                <FaThumbsUp className="size-4.5 text-[#7A78FE] group-hover:scale-105 transition-transform duration-200" />
                            </div>

                            <AnimatePresence>
                                {animatingIcons
                                    .filter((icon) => icon.containerIndex === 0)
                                    .map(({ id, Icon, color }) => (
                                        <motion.div
                                            key={id}
                                            className="absolute left-1/2 top-1/2 pointer-events-none"
                                            initial={{
                                                opacity: 1,
                                                y: 0,
                                                x: '-50%',
                                                scale: 1,
                                                rotate: 0,
                                            }}
                                            animate={{
                                                opacity: 0,
                                                y: -100 - Math.random() * 100,
                                                x: '-50%',
                                                scale: 1 + Math.random(),
                                                rotate: Math.random() * 30 - 15,
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 2.2,
                                                ease: [0.23, 1, 0.32, 1],
                                                opacity: { duration: 2.2, ease: 'easeOut' },
                                                rotate: {
                                                    duration: 0.3,
                                                    ease: 'easeInOut',
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                },
                                            }}
                                        >
                                            <Icon
                                                size={22}
                                                className="drop-shadow-lg"
                                                style={{ color }}
                                            />
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>

                        <div className="relative w-fit h-fit overflow-visible">
                            <div
                                onClick={() => createAnimation(IoMdHeart, '#E5162A', 1)}
                                className="bg-[#E5162A30] border border-[#E5162A] text-black h-9 w-9 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                            >
                                <IoMdHeart className="size-5 text-[#E5162A] mt-px group-hover:scale-105 transition-transform duration-200" />
                            </div>

                            <AnimatePresence>
                                {animatingIcons
                                    .filter((icon) => icon.containerIndex === 1)
                                    .map(({ id, Icon, color }) => (
                                        <motion.div
                                            key={id}
                                            className="absolute left-1/2 top-1/2 pointer-events-none"
                                            initial={{
                                                opacity: 1,
                                                y: 0,
                                                x: '-50%',
                                                scale: 1,
                                                rotate: 0,
                                            }}
                                            animate={{
                                                opacity: 0,
                                                y: -100 - Math.random() * 100,
                                                x: '-50%',
                                                scale: 1 + Math.random(),
                                                rotate: Math.random() * 30 - 15,
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 2.2,
                                                ease: [0.23, 1, 0.32, 1],
                                                opacity: { duration: 2.2, ease: 'easeOut' },
                                                rotate: {
                                                    duration: 0.3,
                                                    ease: 'easeInOut',
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                },
                                            }}
                                        >
                                            <Icon
                                                size={22}
                                                className="drop-shadow-lg"
                                                style={{ color }}
                                            />
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>

                        <div className="relative w-fit h-fit overflow-visible">
                            <div
                                onClick={() =>
                                    createAnimation(PiCurrencyCircleDollarFill, '#38A169', 2)
                                }
                                className="bg-[#0fa65530] border border-[#0fa655] text-black h-9 w-9 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                            >
                                <PiCurrencyCircleDollarFill className="size-5 text-[#38A169] group-hover:scale-105 transition-transform duration-200" />
                            </div>

                            <AnimatePresence>
                                {animatingIcons
                                    .filter((icon) => icon.containerIndex === 2)
                                    .map(({ id, Icon, color }) => (
                                        <motion.div
                                            key={id}
                                            className="absolute left-1/2 top-1/2 pointer-events-none"
                                            initial={{
                                                opacity: 1,
                                                y: 0,
                                                x: '-50%',
                                                scale: 1,
                                                rotate: 0,
                                            }}
                                            animate={{
                                                opacity: 0,
                                                y: -100 - Math.random() * 100,
                                                x: '-50%',
                                                scale: 1 + Math.random(),
                                                rotate: Math.random() * 30 - 15,
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 2.2,
                                                ease: [0.23, 1, 0.32, 1],
                                                opacity: { duration: 2.2, ease: 'easeOut' },
                                                rotate: {
                                                    duration: 0.3,
                                                    ease: 'easeInOut',
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                },
                                            }}
                                        >
                                            <Icon
                                                size={22}
                                                className="drop-shadow-lg"
                                                style={{ color }}
                                            />
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>

                        <div className="relative w-fit h-fit overflow-visible">
                            <div
                                onClick={() => createAnimation(FaLightbulb, '#ffac11', 3)}
                                className="bg-[#ffc22130] border border-[#ffc221] text-black h-9 w-9 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                            >
                                <FaLightbulb className="size-4.5 text-[#ffac11] group-hover:scale-105 transition-transform duration-200" />
                            </div>

                            <AnimatePresence>
                                {animatingIcons
                                    .filter((icon) => icon.containerIndex === 3)
                                    .map(({ id, Icon, color }) => (
                                        <motion.div
                                            key={id}
                                            className="absolute left-1/2 top-1/2 pointer-events-none"
                                            initial={{
                                                opacity: 1,
                                                y: 0,
                                                x: '-50%',
                                                scale: 1,
                                                rotate: 0,
                                            }}
                                            animate={{
                                                opacity: 0,
                                                y: -100 - Math.random() * 100,
                                                x: '-50%',
                                                scale: 1 + Math.random(),
                                                rotate: Math.random() * 30 - 15,
                                            }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 2.2,
                                                ease: [0.23, 1, 0.32, 1],
                                                opacity: { duration: 2.2, ease: 'easeOut' },
                                                rotate: {
                                                    duration: 0.3,
                                                    ease: 'easeInOut',
                                                    repeat: Infinity,
                                                    repeatType: 'reverse',
                                                },
                                            }}
                                        >
                                            <Icon
                                                size={22}
                                                className="drop-shadow-lg"
                                                style={{ color }}
                                            />
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
