'use client';
import { PiCurrencyCircleDollarFill } from 'react-icons/pi';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FaLightbulb, FaThumbsUp } from 'react-icons/fa6';
import { IoMdHeart } from 'react-icons/io';

export default function AnimatedIcons() {
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

    return (
        <div className="flex gap-x-3">
            <div className="relative w-fit h-fit overflow-visible">
                <div
                    onClick={() => createAnimation(FaThumbsUp, '#7A78FE', 0)}
                    className="bg-[#7a78fe30] border border-[#7a78fe] text-black h-7 w-7 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                >
                    <FaThumbsUp className="size-3.5 text-[#7A78FE] group-hover:scale-105 transition-transform duration-200" />
                </div>

                <AnimatePresence>
                    {animatingIcons
                        .filter((icon) => icon.containerIndex === 0)
                        .map(({ id, Icon, color }) => (
                            <motion.div
                                key={id}
                                className="absolute left-1/2 top-1/2 pointer-events-none z-50"
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
                                <Icon size={22} className="drop-shadow-lg" style={{ color }} />
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>

            <div className="relative w-fit h-fit overflow-visible">
                <div
                    onClick={() => createAnimation(IoMdHeart, '#E5162A', 1)}
                    className="bg-[#E5162A30] border border-[#E5162A] text-black h-7 w-7 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                >
                    <IoMdHeart className="size-4 text-[#E5162A] mt-px group-hover:scale-105 transition-transform duration-200" />
                </div>

                <AnimatePresence>
                    {animatingIcons
                        .filter((icon) => icon.containerIndex === 1)
                        .map(({ id, Icon, color }) => (
                            <motion.div
                                key={id}
                                className="absolute left-1/2 top-1/2 pointer-events-none z-10"
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
                                <Icon size={22} className="drop-shadow-lg" style={{ color }} />
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>

            <div className="relative w-fit h-fit overflow-visible">
                <div
                    onClick={() => createAnimation(PiCurrencyCircleDollarFill, '#38A168', 2)}
                    className="bg-[#0fa65530] border border-[#0fa655] text-black h-7 w-7 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                >
                    <PiCurrencyCircleDollarFill className="size-4 text-[#38A168] group-hover:scale-105 transition-transform duration-200" />
                </div>

                <AnimatePresence>
                    {animatingIcons
                        .filter((icon) => icon.containerIndex === 2)
                        .map(({ id, Icon, color }) => (
                            <motion.div
                                key={id}
                                className="absolute left-1/2 top-1/2 pointer-events-none z-10"
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
                                <Icon size={22} className="drop-shadow-lg" style={{ color }} />
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>

            <div className="relative w-fit h-fit overflow-visible">
                <div
                    onClick={() => createAnimation(FaLightbulb, '#ffac11', 3)}
                    className="bg-[#ffc22130] border border-[#ffc221] text-black h-7 w-7 flex justify-center items-center rounded-full shadow-sm cursor-pointer group"
                >
                    <FaLightbulb className="size-4 text-[#ffac11] group-hover:scale-105 transition-transform duration-200" />
                </div>

                <AnimatePresence>
                    {animatingIcons
                        .filter((icon) => icon.containerIndex === 3)
                        .map(({ id, Icon, color }) => (
                            <motion.div
                                key={id}
                                className="absolute left-1/2 top-1/2 pointer-events-none z-10"
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
                                <Icon size={22} className="drop-shadow-lg" style={{ color }} />
                            </motion.div>
                        ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
