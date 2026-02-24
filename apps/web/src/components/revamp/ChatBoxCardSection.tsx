'use client';
import React, { useState } from 'react';
import type { JSX } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { BiSolidChalkboard } from 'react-icons/bi';
import { cn } from '@/lib/utils';
import { MdPublish, MdRocketLaunch } from 'react-icons/md';
import { SiSolana } from 'react-icons/si';
import { CreateCardContent } from '../test/InstructionSectionCards/CreateCardContent';
import InstructionSectionHoverCard from '../test/InstructionSectionCards/InstructionSectionHoverCard';
import { PublishCardContent } from '../test/InstructionSectionCards/PublishCardContent';
import StakeSolanaCardContent from '../test/InstructionSectionCards/StakeSolanaCardContent';
import { ManageCardContent } from '../test/InstructionSectionCards/ManageCardContent';
import InstructionSectionChatBox from '../test/InstructionSectionCards/InstructionSectionChatBox';
import InformationHeadingSection from './InformationHeadingSection';

export default function ChatBoxCardSection(): JSX.Element {
    const controls = useAnimation();
    const [_expanded, setExpanded] = useState<boolean>(false);
    const [activeCard, setActiveCard] = useState<string | null>(null);

    const startSequence = async () => {
        await controls.start('show');
        setExpanded(true);
    };

    const isInactive = (id: string) => activeCard !== null && activeCard !== id;

    return (
        <motion.section
            whileInView="visible"
            initial="hidden"
            viewport={{ once: true, amount: 0.35 }}
            onViewportEnter={startSequence}
            className="relative min-h-screen w-full flex flex-col items-center justify-around font-sans text-dark-base overflow-x-hidden pt-6 max-w-6xl"
        >
            <AnimatePresence>
                {activeCard && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 bg-white/20 z-3"
                    />
                )}
            </AnimatePresence>

            <InformationHeadingSection
                topText="Nocturn Features"
                topTextClassName="text-[#51b4c3]"
                title="Built for a better quiz experience."
                description="Nocturn is where quick thinking meets real competition. Join live quiz challenges, climb the leaderboard, and secure your place."
                buttonTitle="Explore"
                buttonRedirectUrl="/home"
                buttonClassName="bg-[#c2eff5] hover:bg-[#c2eff5]"
            />

            <div className="h-[70vh] w-full bg-[#c2eff5] mt-10 rounded-3xl flex justify-center items-center">
                {/* cards */}
                <div className="relative w-full max-w-216 h-65 z-20 -top-18">
                    <div className="absolute left-0 -bottom-8 -rotate-2">
                        <div
                            onMouseEnter={() => setActiveCard('create')}
                            onMouseLeave={() => setActiveCard(null)}
                            className={cn(
                                'relative group transition-all duration-300',
                                isInactive('create') && 'blur-[3px] opacity-40',
                            )}
                        >
                            <CreateCardContent />
                            {activeCard === 'create' && (
                                <AnimatePresence>
                                    <InstructionSectionHoverCard
                                        icon={<BiSolidChalkboard className="size-5" />}
                                        title="New Quiz"
                                        description="Create your first Noc"
                                        points={[
                                            { color: '#ffd53e', point_title: 'Click on New Quiz' },
                                            {
                                                color: '#70ee3a',
                                                point_title: 'Add questions & options',
                                            },
                                            {
                                                color: '#3ec2ff',
                                                point_title: 'Customize quiz template',
                                            },
                                            { color: '#ff3e3e', point_title: 'Add interactions' },
                                        ]}
                                        className="rotate-0 ml-0"
                                    />
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    <div className="absolute left-53 -bottom-8 rotate-2 hover:z-10 transition-all transform duration-250 hover:scale-105">
                        <div
                            onMouseEnter={() => setActiveCard('publish')}
                            onMouseLeave={() => setActiveCard(null)}
                            className={cn(
                                'relative group transition-all duration-300',
                                isInactive('publish') && 'blur-[3px] opacity-40',
                            )}
                        >
                            <PublishCardContent />
                            {activeCard === 'publish' && (
                                <AnimatePresence>
                                    <InstructionSectionHoverCard
                                        icon={<MdPublish className="size-5" />}
                                        title="Publish Quiz"
                                        description="Save or Publish it for later"
                                        points={[
                                            { color: '#ffd53e', point_title: 'Complete the edits' },
                                            {
                                                color: '#70ee3a',
                                                point_title: 'Save the created draft',
                                            },
                                            {
                                                color: '#3ec2ff',
                                                point_title: 'Publish it to avoid edits',
                                            },
                                            { color: '#ff3e3e', point_title: 'Launch it anytime' },
                                        ]}
                                        className="rotate-0"
                                    />
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    <div className="absolute right-55 -bottom-10 -rotate-3">
                        <div
                            onMouseEnter={() => setActiveCard('launch')}
                            onMouseLeave={() => setActiveCard(null)}
                            className={cn(
                                'relative group transition-all duration-300',
                                isInactive('launch') && 'blur-[3px] opacity-40 ',
                            )}
                        >
                            <StakeSolanaCardContent />
                            {activeCard === 'launch' && (
                                <AnimatePresence>
                                    <InstructionSectionHoverCard
                                        icon={<SiSolana className="" />}
                                        title="Stake SOLANA"
                                        description="Make quiz worth taking"
                                        points={[
                                            {
                                                color: '#ffd53e',
                                                point_title: 'Connect your crypto wallet',
                                            },
                                            { color: '#70ee3a', point_title: 'Go to the quiz' },
                                            {
                                                color: '#3ec2ff',
                                                point_title: 'Add prizes for participants',
                                            },
                                            { color: '#ff3e3e', point_title: 'Make the game fun' },
                                        ]}
                                        className="rotate-0"
                                    />
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    <div className="absolute right-0 -bottom-7 rotate-3">
                        <div
                            onMouseEnter={() => setActiveCard('manage')}
                            onMouseLeave={() => setActiveCard(null)}
                            className={cn(
                                'relative group transition-all duration-300',
                                isInactive('manage') && 'blur-[3px] opacity-40 ',
                            )}
                        >
                            <ManageCardContent />
                            {activeCard === 'manage' && (
                                <AnimatePresence>
                                    <InstructionSectionHoverCard
                                        icon={<MdRocketLaunch className="size-5" />}
                                        title="Live Quiz"
                                        description="The action begins"
                                        points={[
                                            { color: '#ffd53e', point_title: 'Launch the quiz' },
                                            { color: '#70ee3a', point_title: 'Share player codes' },
                                            { color: '#3ec2ff', point_title: 'Begin the game' },
                                            {
                                                color: '#ff3e3e',
                                                point_title: 'See live leaderboards',
                                            },
                                        ]}
                                        className="rotate-0"
                                    />
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <InstructionSectionChatBox />
        </motion.section>
    );
}
