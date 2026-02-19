'use client';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText';
import JoinQuizButton from './JoinQuizButton';
import { RiVipCrown2Line } from 'react-icons/ri';
import { motion } from 'framer-motion';
import LandingSectionLeftCard from './LandingSectionCards/LandingSectionLeftCard';
import LandingSectionMidCard from './LandingSectionCards/LandingSectionMidCard';
import LandingSectionRightCard from './LandingSectionCards/LandingSectionRightCard';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(TextPlugin, SplitText);
}

export default function LandingSection() {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-between pt-30 gap-y-8 select-none">
            <div className="flex flex-col items-center justify-between h-full">
                <div className="flex flex-col gap-y-5 items-center">
                    <motion.div
                        initial={{
                            scale: 0.8,
                            opacity: 0,
                        }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                            delay: 0.5,
                        }}
                        className="bg-alpha/10 text-alpha text-sm px-4 py-1 rounded-full shadow-xs shadow-black/5 ring-1 ring-alpha/40 flex items-center gap-x-1"
                    >
                        <RiVipCrown2Line className="size-3.5" />
                        Mom was right, studying pays
                    </motion.div>
                    <div
                        style={{ fontWeight: 900 }}
                        className="text-[6.5rem] leading-none text-dark-base flex flex-col tracking-tight items-center mb-2 relative"
                    >
                        <motion.div
                            initial={{
                                scale: 0.8,
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                                delay: 0.1,
                            }}
                        >
                            The ultimate fun
                        </motion.div>
                        <motion.div
                            initial={{
                                scale: 0.8,
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                                delay: 0.1,
                            }}
                        >
                            knowledge matters
                        </motion.div>
                    </div>
                    <JoinQuizButton />
                </div>
            </div>

            <div className="h-full w-full flex relative px-40 mt-5">
                <LandingSectionLeftCard />
                <LandingSectionMidCard />
                <LandingSectionRightCard />
            </div>
        </div>
    );
}
