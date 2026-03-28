'use client';
import { JSX, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import LandingHeader from './LandingHeader';
import PerspectiveCard from '../utility/PerspectiveCard';

function UserTypeSection({ heading, description }: { heading: string; description: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });

    return (
        <section ref={ref} className="flex flex-col justify-center px-10 h-full mt-15">
            <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-3xl font-semibold text-dark-base/90"
            >
                {heading}
            </motion.h2>
            <motion.hr
                initial={{ opacity: 0, scaleX: 0 }}
                animate={inView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
                className="w-full border-t border-dark-base/20 mt-3 origin-left"
            />
            <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
                className="text-base text-dark-base/50 mt-2 max-w-sm"
            >
                {description}
            </motion.p>
        </section>
    );
}

export default function LandingUserType(): JSX.Element {
    return (
        <main className="w-full max-w-270 mx-auto pb-16">
            <LandingHeader
                heading="Built for Every Role"
                subheading="Whether you're hosting, playing, or building together — Nocturn adapts to how you work."
            />
            <div className="space-y-20">
                <main className="grid grid-cols-2 w-full h-68">
                    <PerspectiveCard className="bg-pink-300 rounded-l-xl h-full mt-15">
                        <div className="flex items-center justify-center h-full">
                            <span className="text-6xl font-bold text-white/30 tracking-widest">
                                HOST
                            </span>
                        </div>
                    </PerspectiveCard>
                    <UserTypeSection
                        heading="Host Live Quizzes"
                        description="Create and launch real-time quizzes with full control. Set the pace, manage participants, and watch your audience compete — live."
                    />
                </main>
                <main className="grid grid-cols-2 w-full h-68">
                    <UserTypeSection
                        heading="Jump In and Play"
                        description="Join any live quiz in seconds. Answer questions in real time, get instant feedback, and compete for the top spot on the leaderboard."
                    />
                    <PerspectiveCard className="bg-[#7fc8f8] rounded-r-xl h-full mt-15">
                        <div className="flex items-center justify-center h-full">
                            <span className="text-6xl font-bold text-white/30 tracking-widest">
                                PLAYER
                            </span>
                        </div>
                    </PerspectiveCard>
                </main>
                <main className="grid grid-cols-2 w-full h-68">
                    <PerspectiveCard className="bg-[#ffd671] rounded-l-xl h-full mt-15">
                        <div className="flex items-center justify-center h-full">
                            <span className="text-6xl font-bold text-white/30 tracking-widest">
                                COLLAB
                            </span>
                        </div>
                    </PerspectiveCard>
                    <UserTypeSection
                        heading="Build Together"
                        description="Invite teammates to co-create quizzes in real time. Edit simultaneously, stay aligned, and publish when everyone's ready."
                    />
                </main>
            </div>
        </main>
    );
}
