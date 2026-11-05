'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { FiArrowUpRight, FiCheck, FiGlobe, FiZap } from 'react-icons/fi';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import JoinQuizButton from '../test/JoinQuizButton';

const answers = ['Venus', 'Mars', 'Jupiter', 'Saturn'];

export default function LandingHeroSection() {
    const [answer, setAnswer] = useState<string | null>(null);
    const { session, setOpenSigninModal } = useUserSessionStore();
    const router = useRouter();
    const reduceMotion = useReducedMotion();

    function handleCreateQuiz() {
        if (!session) {
            setOpenSigninModal(true);
            return;
        }
        router.push('/home');
    }

    return (
        <section
            className="mx-auto w-full max-w-270 px-6 pt-32 pb-6 text-dark-base sm:pt-40 lg:pb-10 xl:px-0"
            aria-labelledby="landing-hero-title"
        >
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
                <div className="min-w-0">
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-dark-base/65">
                            <span className="flex size-7 items-center justify-center rounded-full bg-nlight text-ndarkest">
                                <FiZap size={14} aria-hidden="true" />
                            </span>
                            A little curiosity. A lot of fun.
                        </p>
                        <h1
                            id="landing-hero-title"
                            className="text-5xl leading-[1.06] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-[64px]"
                        >
                            Big ideas.
                            <br />
                            Great quizzes.
                            <br />
                            <span className="text-ndark">Everyone’s in.</span>
                        </h1>
                        <p className="mt-6 max-w-100 text-base leading-relaxed text-dark-base/65">
                            Turn what you know into a game everyone wants to play. Create with AI,
                            bring your people together, and make learning the best part of their
                            day.
                        </p>
                    </motion.div>
                    <motion.button
                        type="button"
                        onClick={handleCreateQuiz}
                        whileHover={reduceMotion ? undefined : { y: -2 }}
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        className="mt-8 inline-flex min-h-12 cursor-pointer items-center justify-center gap-8 rounded-full bg-dark-base px-6 text-sm font-semibold text-white hover:bg-ndarkest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ndarkest"
                    >
                        Create a quiz <FiArrowUpRight size={19} aria-hidden="true" />
                    </motion.button>
                    <div className="mt-8 max-w-90 border-t border-dark-base/10 pt-5">
                        <JoinQuizButton appearance="landing" />
                    </div>
                </div>

                <div className="relative isolate mx-auto w-full max-w-115 min-w-0 rounded-3xl bg-nlighter p-4 py-8 sm:p-8 sm:py-10">
                    <div
                        aria-hidden="true"
                        className="absolute top-6 right-3 -z-10 size-36 rounded-full bg-pink-200/70 sm:size-44"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute bottom-5 left-3 -z-10 size-28 rounded-full bg-amber-100 sm:size-36"
                    />
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: 2 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{ duration: 0.65, delay: 0.12 }}
                        className="overflow-hidden rounded-2xl border border-dark-base/15 bg-white shadow-xl shadow-ndarkest/10"
                    >
                        <div className="flex items-center justify-between gap-2 border-b border-dark-base/10 px-5 py-4 text-[10px] font-semibold tracking-widest text-dark-base/60">
                            <span className="flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                THE CURIOSITY CLUB
                            </span>
                            <span>01 / 08</span>
                        </div>
                        <div className="p-5 sm:p-6">
                            <p className="text-xs text-dark-base/55">A tiny quiz. Give it a go.</p>
                            <div className="my-5 flex items-center gap-3">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-800">
                                    <FiGlobe size={26} aria-hidden="true" />
                                </span>
                                <span className="text-xs font-medium text-dark-base/55">
                                    SPACE &amp; CURIOSITY
                                </span>
                            </div>
                            <h2 className="max-w-75 text-2xl leading-tight font-semibold tracking-tight">
                                Which planet is known as the Red Planet?
                            </h2>
                            <div
                                className="mt-6 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2"
                                role="group"
                                aria-label="Choose a planet"
                            >
                                {answers.map((option, index) => (
                                    <motion.button
                                        key={option}
                                        type="button"
                                        aria-pressed={answer === option}
                                        onClick={() => setAnswer(option)}
                                        whileHover={reduceMotion ? undefined : { y: -2 }}
                                        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                                        className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ndarkest ${
                                            answer === option
                                                ? 'border-ndarkest bg-nlight text-ndarkest'
                                                : 'border-dark-base/15 bg-white hover:border-ndark hover:bg-nlighter'
                                        }`}
                                    >
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-dark-base/5 text-xs">
                                            {answer === option ? (
                                                <FiCheck aria-hidden="true" />
                                            ) : (
                                                String.fromCharCode(65 + index)
                                            )}
                                        </span>
                                        {option}
                                    </motion.button>
                                ))}
                            </div>
                            <p
                                className="mt-4 min-h-10 text-xs leading-5 text-dark-base/65"
                                role="status"
                            >
                                {answer === null
                                    ? 'Your next “aha!” moment starts here.'
                                    : answer === 'Mars'
                                      ? 'You got it! Mars gets its red color from iron oxide.'
                                      : 'Good guess! It’s Mars. Try the red planet.'}
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 border-t border-dark-base/10 bg-nlighter px-4 py-3 text-xs text-ndarkest">
                            <FiZap aria-hidden="true" /> Small questions. Big energy.
                        </div>
                    </motion.div>
                    <p className="mt-5 text-center text-xs text-ndark">
                        Your people. Your quiz. A good time.
                    </p>
                </div>
            </div>
            <div
                className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-dark-base/55 lg:mt-16"
                aria-label="Ways to use Nocturn"
            >
                {['Made for curious minds', 'Powered by AI', 'Better together', 'Play it live'].map(
                    (feature) => (
                        <span key={feature} className="flex items-center gap-2">
                            <FiCheck className="text-ndark" aria-hidden="true" /> {feature}
                        </span>
                    ),
                )}
            </div>
        </section>
    );
}
