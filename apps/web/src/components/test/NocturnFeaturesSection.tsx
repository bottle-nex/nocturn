'use client';

import { motion } from 'framer-motion';
import NocturnFeaturesSectionCard from './NocutrnFeatureSectionCard';
import { container, fadeUp } from '../animation/framer_motion';

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

            <NocturnFeaturesSectionCard
                imgUrl="/images/landing/create.png"
                heading1="BUILD QUIZZES"
                heading2="NOT BORING ONES"
                description="Design quizzes that actually hold attention. Choose your vibe, enable smart
                        interactions, add bonus points, save drafts, and launch when you’re ready.
                        No clutter, no overthinking, just clean tools that let you focus on creating
                        something people want to play."
                buttonText="ENTER PLAYGROUND"
            />

            <NocturnFeaturesSectionCard
                imgUrl="/images/landing/solana.png"
                heading1="STAKE SOLANA"
                heading2="MAKE IT INTERESTING"
                description="Put your SOL to work without letting it sit around doing nothing. Host
                        quizzes, lock stakes, and reward players based on performance — not luck.
                        It’s staking, but with actual engagement and a reason to care beyond
                        watching numbers go up."
                invert={true}
                buttonText="CONNECT WALLET"
            />
            <NocturnFeaturesSectionCard
                imgUrl="/images/landing/controller.jpg"
                heading1="play hard"
                heading2="think faster"
                description="Jump into live quizzes packed with lifelines, time pressure, and real
                        rewards. Every second counts, every answer matters, and guessing won’t save
                        you. It’s competitive, fast-paced, and way more fun than scrolling for
                        another five minutes."
                buttonText="JOIN ARENA"
            />
        </div>
    );
}
