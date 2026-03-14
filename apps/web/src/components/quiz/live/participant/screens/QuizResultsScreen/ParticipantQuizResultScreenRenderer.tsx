'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { JSX, useEffect, useState } from 'react';
import AppLogo from '@/components/app/AppLogo';
import FallingAvatars from '@/components/animation/FallingAvatars';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { QuizEndScreen } from '@nocturn/types';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useCannonConfetti } from '@/hooks/useCannonConfetti';
import { barColors } from '../../../host/screens/QuizResultsScreen/HostQuizResultsScreensRenderer';

export default function ParticipantQuizResultScreenRenderer(): JSX.Element {
    const { gameSession } = useLiveQuizStore();
    const isExiting = false;
    const [showAvatars, setShowAvatars] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowAvatars(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="w-full flex items-center justify-center">
            <section className="fixed -top-4 right-2 flex items-center justify-center rounded-full h-24 z-20">
                <div className="flex items-center gap-x-1.5 bg-neutral-100 w-fit px-4 py-2.5 rounded-full shadow-md z-10 translate-x-4">
                    <div className="text-xs text-neutral-700 font-light tracking-wide">Press</div>
                    <ToolTipComponent content="Pressing enter will reveal the quiz results">
                        <span className="bg-neutral-900 text-neutral-100 text-xs font-light tracking-wider px-3 py-1 rounded-lg flex items-center justify-center gap-x-2 cursor-pointer">
                            ENTER
                        </span>
                    </ToolTipComponent>
                    <div className="text-xs text-neutral-700 font-light tracking-wide">
                        to complete the quiz
                    </div>
                </div>
                <AppLogo size={120} className="" />
            </section>

            <section className="max-w-7xl mx-auto h-[80dvh] w-full bg-light-alpha rounded-xl relative overflow-hidden">
                <div className="absolute -top-2 -left-2 z-10">
                    <AppLogo withText size={120} textColor="text-dark-base" />
                </div>
                <AnimatePresence mode="wait">
                    {gameSession?.quizEndScreen === QuizEndScreen.ARE_YOU_UP && (
                        <motion.section
                            key="result-ready"
                            className="pt-12 px-12 h-full"
                            exit={{
                                y: '110%',
                                opacity: 0,
                                transition: { duration: 0.7, ease: [0.4, 0, 1, 1] },
                            }}
                        >
                            <ResultReadyScreen isExiting={isExiting} showAvatars={showAvatars} />
                        </motion.section>
                    )}
                    {gameSession?.quizEndScreen === QuizEndScreen.READY_TO_ANNOUNCE && (
                        <motion.section
                            key="ready-to-announce"
                            className="h-full w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <ReadyToAnnounceScreen />
                        </motion.section>
                    )}
                    {gameSession?.quizEndScreen === QuizEndScreen.ANNOUNCED && (
                        <motion.section
                            key="final-announcement"
                            className="h-full w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <FinalAnnouncementScreen />
                        </motion.section>
                    )}
                </AnimatePresence>
            </section>
        </main>
    );
}

function ResultReadyScreen({
    isExiting,
    showAvatars,
}: {
    isExiting: boolean;
    showAvatars: boolean;
}): JSX.Element {
    const { participants } = useLiveParticipantsStore();
    return (
        <div className="w-full h-full relative">
            <section className="flex flex-col items-center justify-center h-full z-10 relative -mt-8">
                <motion.h1
                    className="text-center text-7xl text-dark-alpha"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Quiz has Ended
                </motion.h1>
                <motion.p
                    className="mt-6 text-xl text-center text-dark-base/80 tracking-widest uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Have you given your best shot?
                </motion.p>
            </section>
            {showAvatars && (
                <section className="inset-0 absolute">
                    <FallingAvatars
                        participants={participants}
                        ballRadius={44}
                        isExiting={isExiting}
                    />
                </section>
            )}
        </div>
    );
}

function ReadyToAnnounceScreen(): JSX.Element {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-x-5 gap-y-2 px-12">
                <motion.h1
                    className="text-center text-7xl text-dark-alpha"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    The winners are about to be announced
                </motion.h1>
                <motion.p
                    className="mt-6 text-xl text-center text-dark-base/60 tracking-widest uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Hold your breath
                </motion.p>
            </div>
        </div>
    );
}

function FinalAnnouncementScreen(): JSX.Element {
    useCannonConfetti({ duration: 2500 });
    const { participants } = useLiveParticipantsStore();
    const sorted = [...participants]
        .sort((a, b) => b.totalScore - a.totalScore)
        .map((p, i) => ({
            avatar: p.avatar ?? '',
            position: p.finalRank ?? i + 1,
            name: p.nickname,
            score: p.totalScore,
        }));
    const topThree = sorted.filter((d) => d.position <= 3);
    const rest = sorted.filter((d) => d.position > 3);
    const maxScore = rest[0]?.score ?? 1;
    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar pt-8" data-lenis-prevent>
            <div className="flex items-center justify-center gap-x-12 pt-16 pb-8">
                {[...topThree]
                    .sort((a, b) => (a.position % 2) - (b.position % 2) || a.position - b.position)
                    .map((item) => (
                        <div
                            key={item.position}
                            className={cn('relative', item.position === 1 && '-translate-y-6')}
                        >
                            {item.position === 1 && (
                                <Image
                                    alt="crown"
                                    src={'/images/crown.png'}
                                    width={80}
                                    height={80}
                                    className="absolute -top-14 -rotate-20"
                                />
                            )}
                            <Image
                                src={item.avatar}
                                alt={`Position ${item.position}`}
                                width={120}
                                height={120}
                                className="rounded-full"
                            />
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs font-semibold text-neutral-800 aspect-square">
                                <span className="block text-center font-bold">
                                    #{item.position}
                                </span>
                            </div>
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center text-xl! font-normal text-dark-faded">
                                <span className="block text-black">{item.name.split(' ')[0]}</span>
                                <span className="block text-sm text-dark-faded/80">
                                    {item.score}
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="px-8 pb-8 flex flex-col gap-y-0 max-w-4xl mx-auto mt-12">
                {rest.map((item) => {
                    const barWidthPercent = (item.score / maxScore) * 90;
                    return (
                        <div key={item.position} className="flex items-center gap-x-3">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: (item.position - 4) * 0.04 + 0.6,
                                    ease: 'easeOut',
                                }}
                                className="text-lg font-bold text-neutral-700 w-20 text-right shrink-0"
                            >
                                {item.score.toLocaleString()} p
                            </motion.span>
                            <div className="flex-1 flex items-center min-w-0">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidthPercent}%` }}
                                    transition={{
                                        duration: 0.8,
                                        delay: (item.position - 4) * 0.04,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="h-10 rounded-r-full shrink-0"
                                    style={{
                                        backgroundColor:
                                            barColors[Math.floor(Math.random() * barColors.length)],
                                    }}
                                />
                                <div className="relative w-11 h-11 shrink-0 -translate-x-8 rounded-full bg-white border-2 border-white">
                                    <Image
                                        src={item.avatar}
                                        alt={item.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <span className="text-lg font-semibold text-neutral-800 shrink-0 w-28 text-nowrap truncate">
                                    {item.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
