'use client';
import React, { useState } from 'react';
import type { JSX } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { IoMicOutline } from 'react-icons/io5';
import {
    CreateCardContent,
    LaunchCardContent,
    ManageCardContent,
    PublishCardContent,
} from './InstructionSectionCards';
import { GoPlus } from 'react-icons/go';
import SectionHeading from '../ui/SectionHeading';
import { BiCool } from 'react-icons/bi';
import { PiTreePalmFill } from 'react-icons/pi';
import { cards, pill, pillContent } from '../utility/framer-utils/InstructionSectionUtils';

export default function App(): JSX.Element {
    const controls = useAnimation();
    const [_expanded, setExpanded] = useState<boolean>(false);

    const startSequence = async () => {
        await controls.start('show');
        setExpanded(true);
    };
    return (
        <motion.section
            whileInView="visible"
            initial="hidden"
            viewport={{ once: true, amount: 0.35 }}
            onViewportEnter={startSequence}
            className="relative min-h-screen w-full bg-light-base flex flex-col items-center justify-around px-6 font-sans text-dark-base overflow-x-hidden"
        >
            <div className="inset-0 absolute">
                <div className="relative h-full w-full">
                    <PiTreePalmFill className="size-160 absolute -bottom-20 left-10 opacity-5 rotate-12" />
                </div>
            </div>

            <SectionHeading
                title="The Nocturn Workflow"
                description="Create engaging live quizzes with real-time multiplayer experiences, collaborate with your team on quiz content, and publish to your audience. From creation to launch, manage every aspect of your quiz seamlessly."
                icon={<BiCool className="size-4" />}
                ticker="acknowledge us"
            />

            {/* cards */}
            <div className="relative w-full max-w-216 h-65 z-10 -top-20">
                {[CreateCardContent, PublishCardContent, LaunchCardContent, ManageCardContent].map(
                    (Card, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            variants={cards}
                            initial="hidden"
                            animate="show"
                            className={
                                [
                                    'absolute left-0 bottom-2 -rotate-2',
                                    'absolute left-53 bottom-4 rotate-2',
                                    'absolute right-55 bottom-2 -rotate-3',
                                    'absolute right-0 bottom-2 rotate-3',
                                ][i]
                            }
                        >
                            <Card />
                        </motion.div>
                    ),
                )}
            </div>

            {/* expanding mic */}
            <div className="absolute top-[75%]">
                <motion.div
                    variants={pill}
                    initial="hidden"
                    animate="show"
                    className="relative z-20 h-15 rounded-full bg-light-alpha ring-1 ring-black/10 shadow-sm flex items-center px-6 overflow-hidden"
                >
                    <motion.div
                        variants={pillContent}
                        initial="hidden"
                        animate="show"
                        className="flex w-full justify-between items-center"
                    >
                        <div className="text-neutral-400/80 text-sm">Create a quiz for me....</div>

                        <div className="flex gap-x-2.5 mt-px">
                            <GoPlus className="size-5.5" />
                            <IoMicOutline className="size-5" />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
}
