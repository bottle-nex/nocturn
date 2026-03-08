'use client';
import Image from 'next/image';
import AppLogo from '@/components/app/AppLogo';
import { cn } from '@/lib/utils';
import FallingAvatars from '@/components/animation/FallingAvatars';
import { AnimatePresence, motion } from 'framer-motion';
import { JSX, useEffect, useState } from 'react';
import { QuizEndScreen } from '@nocturn/types';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useCannonConfetti } from '@/hooks/useCannonConfetti';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';

const barColors = [
    '#841836',
    '#a4133c',
    '#c9184a',
    '#ff4d6d',
    '#ff758f',
    '#ff8fa3',
    '#1b035e',
    '#310e8a',
    '#5500b6',
    '#2100c7',
    '#7300d8',
    '#7248e4',
];

export default function HostQuizResultsScreensRenderer(): JSX.Element {
    const { gameSession } = useLiveQuizStore();
    const [showAvatars, setShowAvatars] = useState(false);
    const { handleAdvanceQuizEndScreen } = useWebSocket();

    useEffect(() => {
        const timer = setTimeout(() => setShowAvatars(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Enter') {
                handleAdvanceQuizEndScreen();
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <main className="w-full flex items-center justify-center">
            <section className="max-w-7xl mx-auto h-[80dvh] w-full rounded-xl relative overflow-hidden bg-white z-10">
                <div className="absolute -top-2 -left-2 z-10">
                    <AppLogo withText size={120} textColor="text-dark-base dark:text-dark-base" />
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
                            <ResultReadyScreen isExiting={false} showAvatars={showAvatars} />
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
                    className="mt-6 text-xl text-center text-dark-base/60 tracking-widest uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Press Enter to reveal results
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
                    Should we announce the winners ?
                </motion.h1>
                <motion.p
                    className="mt-6 text-xl text-center text-dark-base/60 tracking-widest uppercase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Press Enter to reveal
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
