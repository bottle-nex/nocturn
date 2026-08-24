'use client';
import { JSX, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import LandingSectionHeader from './LandingSectionHeader';
import HostUserGridCard from './LandingUserTypeCards/HostUserGridCard';
import ParticipantUserCard from './LandingUserTypeCards/ParticipantUserCard';
import SpectatorUserCard from './LandingUserTypeCards/SpectatorUserCard';

function UserTypeSection({ heading, description }: { heading: string; description: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section ref={ref} className="flex flex-col justify-center px-4 md:px-10 h-full">
            <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-3xl font-bold text-dark-base/90 tracking-tighter"
            >
                {heading}
            </motion.h2>
            <motion.hr
                initial={{ opacity: 0, scaleX: 0 }}
                animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
                className="w-full border-t border-dark-base/10 mt-4 origin-left"
            />
            <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
                className="text-base text-dark-base/60 mt-3 max-w-sm leading-relaxed"
            >
                {description}
            </motion.p>
        </section>
    );
}

export default function LandingUserType(): JSX.Element {
    return (
        <main className="w-full max-w-270 mx-auto py-24 pb-32 px-6">
            <LandingSectionHeader
                heading="Built for Every Role"
                subheading="Whether you're hosting, playing, or building together — Nocturn adapts to how you work."
            />

            <div className="space-y-32 mt-20">
                <main className="grid grid-cols-1 md:grid-cols-2 w-full h-auto md:h-72 items-center gap-12 md:gap-0">
                    <HostUserGridCard />
                    <UserTypeSection
                        heading="Host Live Quizzes"
                        description="Create and launch real-time quizzes with full control. Set the pace, manage participants, and watch your audience compete — live."
                    />
                </main>

                <main className="grid grid-cols-1 md:grid-cols-2 w-full h-auto md:h-72 items-center gap-12 md:gap-0">
                    <div className="">
                        <UserTypeSection
                            heading="Jump In and Play"
                            description="Join any live quiz in seconds. Answer questions in real time, get instant feedback, and compete for the top spot on the leaderboard."
                        />
                    </div>
                    <ParticipantUserCard />
                </main>

                <main className="grid grid-cols-1 md:grid-cols-2 w-full h-auto md:h-72 items-center gap-12 md:gap-0">
                    <SpectatorUserCard />
                    <UserTypeSection
                        heading="Watch over the Game"
                        description="Monitor the game, help participants through lifelines, and engage with real-time audience polls without the risk."
                    />
                </main>
            </div>
        </main>
    );
}
