'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { JSX, useEffect, useRef, useState } from 'react';
import AppLogo from '@/components/app/AppLogo';
import FallingAvatars from '@/components/animation/FallingAvatars';
import ToolTipComponent from '@/components/utility/TooltipComponent';

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

enum QUIZ_RESULT_PHASES {
    RESULT_READY = 'RESULT_READY',
    READY_TO_ANNOUNCE = 'READY_TO_ANNOUNCE',
    ANNOUNCED = 'ANNOUNCED',
}

export default function Page(): JSX.Element {
    const [phase, setPhase] = useState<QUIZ_RESULT_PHASES>(QUIZ_RESULT_PHASES.RESULT_READY);
    const [isExiting, setIsExiting] = useState(false);
    const [showAvatars, setShowAvatars] = useState(false);
    const enterFiredRef = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowAvatars(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.key === 'Enter' &&
                !enterFiredRef.current &&
                showAvatars &&
                phase === QUIZ_RESULT_PHASES.RESULT_READY
            ) {
                enterFiredRef.current = true;
                setIsExiting(true);
                setTimeout(() => setPhase(QUIZ_RESULT_PHASES.READY_TO_ANNOUNCE), 750);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [showAvatars, phase]);

    return (
        <main className="max-h-screen min-h-screen bg-black flex items-center justify-center relative">
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
                    {phase === QUIZ_RESULT_PHASES.RESULT_READY && (
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
                    {phase === QUIZ_RESULT_PHASES.READY_TO_ANNOUNCE && (
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
