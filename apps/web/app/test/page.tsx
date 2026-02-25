'use client';
import AppLogo from '@/components/app/AppLogo';
import FallingAvatars from '@/components/animation/FallingAvatars';
import { JSX, useState } from 'react';

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

// const PHASE_ORDER = [
//     QUIZ_RESULT_PHASES.RESULT_READY,
//     QUIZ_RESULT_PHASES.READY_TO_ANNOUNCE,
//     QUIZ_RESULT_PHASES.ANNOUNCED,
// ] as const;

// function simulatePhases(
//     setPhase: (phase: QUIZ_RESULT_PHASES) => void,
//     interval = 3000
// ): () => void {
//     const timers: ReturnType<typeof setTimeout>[] = [];

//     PHASE_ORDER.forEach((phase, i) => {
//         if (i === 0) return;
//         timers.push(
//             setTimeout(() => setPhase(phase), interval * i)
//         );
//     });

//     return () => timers.forEach(clearTimeout);
// }

export default function Page(): JSX.Element {
    const [phase, _setPhase] = useState<QUIZ_RESULT_PHASES>(QUIZ_RESULT_PHASES.RESULT_READY);

    // useEffect(() => {
    //     const cleanup = simulatePhases(setPhase);
    //     return cleanup;
    // }, []);

    return (
        <main className="max-h-screen min-h-screen bg-black flex items-center justify-center">
            <section className="max-w-7xl mx-auto h-[80dvh] w-full bg-light-alpha rounded-xl relative">
                <div className="absolute -top-2 -left-2">
                    <AppLogo withText size={120} textColor="text-dark-base dark:text-light-base" />
                </div>
                <section className="flex-1 pt-12 px-12 h-full">
                    {phase === QUIZ_RESULT_PHASES.RESULT_READY && <ResultReadyScreen />}
                </section>
            </section>
        </main>
    );
}

function ResultReadyScreen(): JSX.Element {
    return (
        <div className="w-full h-full relative">
            <section className="flex flex-col items-center justify-center h-full z-10 relative -mt-8">
                <h1 className="text-center text-7xl">Quiz has Ended</h1>
                <p className="text-center text-3xl">The results are out</p>
            </section>
            <section className="inset-0 absolute">
                <FallingAvatars users={users} ballRadius={44} />
            </section>
        </div>
    );
}
