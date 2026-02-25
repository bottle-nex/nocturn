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
            {/* <AnimatePresence>
                {activeCard && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 bg-white/20 z-3"
                    />
                )}
            </AnimatePresence> */}

            <InformationHeadingSection
                topText="Nocturn Features"
                topTextClassName="text-[#219ebc]"
                title="Built for a better quiz experience."
                description="Nocturn is where quick thinking meets real competition. Join live quiz challenges, climb the leaderboard, and secure your place."
                buttonTitle="Explore"
                buttonRedirectUrl="/home"
                buttonClassName="bg-[#8ecae6] hover:bg-[#8ecae6] shadow-[inset_0px_1.5px_rgba(0,0,0,0.05)] shrink-0 ml-px"
            />

            <div className="h-150 w-full bg-[#8ecae6] mt-10 rounded-3xl flex justify-center items-center shadow-xs shadow-black/5">
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

            <path
                d="M760.335 158.683C754.02 112.579 687.535 114.159 682.951 160.079L682.005 160.193C668.623 120.58 610.275 127.504 606.52 169.127L605.575 169.241C596.911 140.422 555.522 133.425 537.908 157.8C518.712 180.987 535.838 219.339 565.882 220.479L565.975 221.248C525.679 234.478 532.884 293.908 575.141 297.172L575.234 297.941C546.254 306.117 538.659 347.453 562.851 365.402C585.764 384.915 624.347 368.173 625.752 338.108L626.697 337.994C640.065 377.49 698.758 370.943 702.191 328.88L703.136 328.766C711.394 356.464 750.845 364.775 769.298 341.888C790.239 318.76 773.775 279.189 742.614 277.733L742.521 276.965C782.817 263.734 775.612 204.304 733.355 201.04L733.262 200.272C750.815 195.244 762.825 176.823 760.339 158.712L760.335 158.683Z"
                fill="var(--graphic-blue)"
            ></path>
        </motion.section>
    );
}
