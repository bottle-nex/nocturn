'use client';

import { motion, Variants } from 'framer-motion';
import { Button } from '../ui/button';
import Image from 'next/image';
import { IoArrowForwardOutline } from 'react-icons/io5';

/* ---------- shared animation variants ---------- */

const container: Variants = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.25,
            staggerChildren: 0.12,
        },
    },
};

const fadeUp: Variants = {
    hidden: {
        opacity: 0,
        y: 48,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
};

const imageReveal: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.96,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

export default function NocturnFeaturesSection() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-white overflow-hidden py-20 gap-y-20 relative">
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-120px' }}
                className="w-full max-w-[80%] flex flex-col items-center text-7xl font-semibold gap-y-1.5 text-black"
            >
                <motion.span variants={fadeUp}>With great knowledge</motion.span>

                <motion.span variants={fadeUp} className="text-black">
                    comes great rewards
                </motion.span>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-120px' }}
                className="w-full flex justify-around pt-10 text-black"
            >
                <motion.div
                    variants={imageReveal}
                    className="h-130 w-130 border-3 border-black relative rounded-3xl overflow-hidden"
                >
                    <Image
                        src="/images/landing/create.png"
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </motion.div>

                <div className="h-130 w-130 flex flex-col gap-y-10 py-5">
                    <motion.div variants={fadeUp} className="text-6xl font-bold">
                        BUILD QUIZZES.
                        <br />
                        NOT BORING ONES.
                    </motion.div>

                    <motion.div variants={fadeUp} className="text-xl leading-relaxed">
                        Design quizzes that actually hold attention. Choose your vibe, enable smart
                        interactions, add bonus points, save drafts, and launch when you’re ready.
                        No clutter, no overthinking, just clean tools that let you focus on creating
                        something people want to play.
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <Button className="bg-black text-white border-2 border-black text-xl h-13 hover:bg-white hover:text-black flex items-center gap-2">
                            ENTER PLAYGROUND
                            <IoArrowForwardOutline className="size-5" />
                        </Button>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: '-120px' }}
                className="w-full flex justify-around pt-20 text-black"
            >
                <div className="h-130 w-130 flex flex-col gap-y-10">
                    <motion.div variants={fadeUp} className="text-6xl font-bold">
                        STAKE SOLANA.
                        <br />
                        MAKE IT INTERESTING.
                    </motion.div>

                    <motion.div variants={fadeUp} className="text-xl leading-relaxed">
                        Put your SOL to work without letting it sit around doing nothing. Host
                        quizzes, lock stakes, and reward players based on performance — not luck.
                        It’s staking, but with actual engagement and a reason to care beyond
                        watching numbers go up.
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <Button className="bg-black text-white border-2 border-black text-xl h-13 hover:bg-white hover:text-black flex items-center gap-2">
                            CONNECT WALLET
                            <IoArrowForwardOutline className="size-5" />
                        </Button>
                    </motion.div>
                </div>

                <motion.div
                    variants={imageReveal}
                    className="h-130 w-130 border-2 border-black relative rounded-3xl overflow-hidden"
                >
                    <Image
                        src="/images/landing/solana.png"
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </motion.div>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-120px' }}
                className="w-full flex justify-around pt-20 text-black"
            >
                <motion.div
                    variants={imageReveal}
                    className="h-130 w-130 border-3 border-black relative rounded-3xl overflow-hidden"
                >
                    <Image
                        src="/images/landing/controller.jpg"
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </motion.div>

                <div className="h-130 w-130 flex flex-col gap-y-10 py-5">
                    <motion.div variants={fadeUp} className="text-6xl font-bold">
                        PLAY HARD.
                        <br />
                        THINK FASTER.
                    </motion.div>

                    <motion.div variants={fadeUp} className="text-xl leading-relaxed">
                        Jump into live quizzes packed with lifelines, time pressure, and real
                        rewards. Every second counts, every answer matters, and guessing won’t save
                        you. It’s competitive, fast-paced, and way more fun than scrolling for
                        another five minutes.
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <Button className="bg-black text-white border-2 border-black text-xl h-13 hover:bg-white hover:text-black flex items-center gap-2">
                            JOIN ARENA
                            <IoArrowForwardOutline className="size-5" />
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
