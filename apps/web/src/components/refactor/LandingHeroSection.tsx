'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowUpRight, FiCheck, FiRotateCcw, FiUsers, FiZap } from 'react-icons/fi';
import JoinQuizButton from '../test/JoinQuizButton';

const answers = ['Venus', 'Mars', 'Jupiter', 'Saturn'];
const steps = [
    { number: '01', title: 'Make it yours', detail: 'Create with AI or start from scratch.' },
    { number: '02', title: 'Bring your people', detail: 'One code. Everyone’s in.' },
    { number: '03', title: 'Play for the podium', detail: 'Live questions. Friendly competition.' },
];

export default function LandingHeroSection() {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const answered = selectedAnswer !== null;
    const correct = selectedAnswer === 1;

    return (
        <section
            aria-labelledby="landing-hero-heading"
            className="w-full max-w-270 px-6 pb-6 pt-28 text-[#242424] md:pt-36 xl:px-0"
        >
            <div className="relative border-2 border-[#242424] bg-[#fffdf5] shadow-[6px_6px_0_#242424] sm:shadow-[8px_8px_0_#242424]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#242424] bg-[#e6dbff] px-5 py-3 text-xs font-bold uppercase tracking-widest sm:px-8">
                    <span className="flex items-center gap-2">
                        <FiZap aria-hidden="true" className="size-4" />
                        Big brains. Bigger energy.
                    </span>
                    <span className="hidden sm:block">The quiz is just the beginning ↗</span>
                </div>

                <div className="grid gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
                    <div className="flex flex-col items-start justify-center">
                        <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <span aria-hidden="true" className="size-2.5 bg-[#242424]" />A little
                            knowledge. A lot of fun.
                        </p>
                        <h1
                            id="landing-hero-heading"
                            className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-[4.25rem]"
                        >
                            Knowledge
                            <br />
                            that pays
                            <br />
                            <span className="mt-2 inline-block -rotate-2 border-2 border-[#242424] bg-[#f9e66c] px-3 pb-2 shadow-[4px_4px_0_#242424]">
                                off.
                            </span>
                        </h1>
                        <p className="mt-7 max-w-sm text-base leading-relaxed text-[#4d4a43] sm:text-lg">
                            Turn what you know into a little friendly competition. Create a quiz,
                            gather your people, and let the games begin.
                        </p>
                        <Link
                            href="/home"
                            className="mt-7 inline-flex items-center gap-5 border-2 border-[#242424] bg-[#f9e66c] px-5 py-3 text-base font-bold shadow-[4px_4px_0_#242424] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#242424] active:translate-y-1 motion-reduce:transition-none"
                        >
                            Create a quiz
                            <FiArrowUpRight aria-hidden="true" className="size-5" />
                        </Link>
                        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
                            <span className="text-sm text-[#4d4a43]">Got a game code?</span>
                            <JoinQuizButton />
                        </div>
                    </div>

                    <div className="relative min-w-0 self-center pb-3 lg:pt-5">
                        <div className="absolute -top-4 right-3 z-10 rotate-6 border-2 border-[#242424] bg-[#f9e66c] px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0_#242424] lg:-top-1">
                            Your brain. Your move.
                        </div>
                        <div className="border-2 border-[#242424] bg-white shadow-[6px_6px_0_#242424]">
                            <div className="flex items-center justify-between gap-2 border-b-2 border-[#242424] bg-[#242424] px-4 py-3 text-white sm:px-5">
                                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                    <span
                                        aria-hidden="true"
                                        className="size-2 rounded-full bg-[#c4edba]"
                                    />
                                    The warm-up round
                                </span>
                                <span className="text-xs">Quiz preview</span>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider">
                                    <span className="border border-[#242424] bg-[#e6dbff] px-2 py-1">
                                        Space trivia
                                    </span>
                                    <span>Question 01</span>
                                </div>
                                <h2 className="mb-6 mt-5 text-2xl font-bold leading-tight sm:text-3xl">
                                    Which planet is known as the Red Planet?
                                </h2>
                                <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                                    {answers.map((answer, index) => {
                                        const isSelected = selectedAnswer === index;
                                        const isCorrect = answered && index === 1;

                                        return (
                                            <button
                                                key={answer}
                                                type="button"
                                                disabled={answered}
                                                aria-pressed={isSelected}
                                                onClick={() => setSelectedAnswer(index)}
                                                className={`flex min-h-14 items-center gap-2 border-2 border-[#242424] px-3 py-3 text-left text-sm font-bold shadow-[3px_3px_0_#242424] transition-transform enabled:cursor-pointer enabled:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#242424] motion-reduce:transition-none ${
                                                    isCorrect
                                                        ? 'bg-[#c4edba]'
                                                        : isSelected
                                                          ? 'bg-[#ffcec5]'
                                                          : 'bg-[#fffdf5]'
                                                }`}
                                            >
                                                <span className="flex size-6 shrink-0 items-center justify-center border border-[#242424] bg-white text-xs">
                                                    {isCorrect ? (
                                                        <FiCheck aria-hidden="true" />
                                                    ) : (
                                                        String.fromCharCode(65 + index)
                                                    )}
                                                </span>
                                                {answer}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div
                                    role="status"
                                    aria-live="polite"
                                    aria-atomic="true"
                                    className="mt-6 min-h-20 border-t-2 border-dashed border-[#242424]/20 pt-4 text-sm leading-relaxed"
                                >
                                    {answered ? (
                                        <>
                                            <p className="font-bold">
                                                {correct
                                                    ? 'You’ve got it! Hello, Mars.'
                                                    : 'Close! The answer is Mars.'}
                                            </p>
                                            <p>Iron in its soil gives it that rusty red glow.</p>
                                        </>
                                    ) : (
                                        <p>Go on, pick an answer. This round’s just for fun.</p>
                                    )}
                                </div>
                                {answered && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAnswer(null)}
                                        className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#242424]"
                                    >
                                        <FiRotateCcw aria-hidden="true" />
                                        Play again
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 border-t-2 border-[#242424] bg-[#c4edba] px-4 py-3 text-xs font-bold sm:px-6">
                                <FiUsers aria-hidden="true" className="size-4 shrink-0" />
                                Better with friends. Even better with rivals.
                            </div>
                        </div>
                    </div>
                </div>

                <ol className="grid border-t-2 border-[#242424] md:grid-cols-3">
                    {steps.map(({ number, title, detail }) => (
                        <li
                            key={number}
                            className="flex gap-3 border-b-2 border-[#242424] px-5 py-5 last:border-b-0 sm:px-8 md:border-b-0 md:border-r-2 md:last:border-r-0"
                        >
                            <span className="text-sm font-bold text-[#686258]">{number}</span>
                            <div>
                                <p className="font-bold">{title}</p>
                                <p className="mt-1 text-sm leading-relaxed text-[#4d4a43]">
                                    {detail}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
