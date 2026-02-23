'use client';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText';
import JoinQuizButton from './JoinQuizButton';
import { RiVipCrown2Line } from 'react-icons/ri';
import { motion } from 'framer-motion';
import Shuffle from '../animation/ShuffleText';
import LandingSectionLeftCard from './LandingSectionCards/LandingSectionLeftCard';
import LandingSectionMidCard from './LandingSectionCards/LandingSectionMidCard';
import LandingSectionRightCard from './LandingSectionCards/LandingSectionRightCard';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(TextPlugin, SplitText);
}

export default function LandingSection() {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-between pt-30 gap-y-8 select-none relative">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 0',
                    maskImage: `
          repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
      `,
                    WebkitMaskImage: `
    repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
      `,
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                }}
            />
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
                    <div className="leading-none text-dark-base flex flex-col tracking-tight items-center mb-2 relative max-w-220 text-center">
                        <Shuffle
                            text="Nocturn"
                            tag="h1"
                            className="text-[12.5rem] italic font-semibold z-9999"
                            shuffleDirection="up"
                        />
                        <motion.div
                            className="text-[1.2rem] text-dark-base/60 tracking-wide"
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
                            Host live quizzes, compete in real time, and win crypto rewards. where
                            knowledge meets the blockchain.
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
