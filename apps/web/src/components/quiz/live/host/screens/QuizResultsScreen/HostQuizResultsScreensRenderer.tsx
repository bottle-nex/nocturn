'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { JSX, useEffect, useState } from 'react';
import AppLogo from '@/components/app/AppLogo';
import FallingAvatars from '@/components/animation/FallingAvatars';
import { QuizEndScreen } from '@nocturn/types';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';

const users = [
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-8.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-12.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-8.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-12.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-8.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg' },
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
                    <FallingAvatars users={users} ballRadius={44} isExiting={isExiting} />
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
