'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { JSX } from 'react';
import AppLogo from '@/components/app/AppLogo';
import FallingAvatars from '@/components/animation/FallingAvatars';
import { QuizEndScreen } from '@nocturn/types';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';

export default function SpectatorQuizResultScreenRenderer(): JSX.Element {
    const { gameSession } = useLiveQuizStore();
    const isExiting = false;
    const showAvatars = true;

    return (
        <main className="w-full flex items-center justify-center">
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
                    Are you excited to know are the winners?
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
