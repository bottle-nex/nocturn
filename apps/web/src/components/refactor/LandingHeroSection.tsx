'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline, IoLockClosedOutline } from 'react-icons/io5';
import { VscSymbolStructure } from 'react-icons/vsc';
import JoinQuizButton from '../test/JoinQuizButton';
import { cn } from '@/lib/utils';
import { audio } from '../test/LandingFooter';
import { GoPlus } from 'react-icons/go';
import { FiArrowUp, FiCheck, FiClock } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaHeart } from 'react-icons/fa6';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';
import { FaGamepad } from 'react-icons/fa';
import { HiFire, HiSparkles } from 'react-icons/hi2';
import Image from 'next/image';

interface Person {
    id: string;
    avatar: string;
    name: string;
    role: 'participant' | 'spectator';
}

const people: Person[] = [
    {
        id: 'sophia',
        avatar: '/avatars/avatar-3.png',
        name: 'Sophia Thomas',
        role: 'spectator',
    },
    {
        id: 'emily',
        avatar: '/avatars/avatar-7.png',
        name: 'Emily Davis',
        role: 'participant',
    },
    {
        id: 'ethan',
        avatar: '/avatars/avatar-12.png',
        name: 'Ethan Lee',
        role: 'spectator',
    },
];

const reactionIcons = [
    { Icon: FaHeart, color: '#E53E3E' },
    { Icon: BsFillHandThumbsUpFill, color: '#3182CE' },
    { Icon: HiFire, color: '#F6AD55' },
];

interface FloatingReaction {
    id: number;
    personId: string;
    iconIndex: number;
}

function LiveActivityCard() {
    const [order, setOrder] = useState<Person[]>(people);
    const [reactions, setReactions] = useState<FloatingReaction[]>([]);

    const swapAdjacent = useCallback(() => {
        setOrder((prev) => {
            const copy = [...prev];
            const swapIndex = Math.random() < 0.5 ? 0 : 1;
            [copy[swapIndex], copy[swapIndex + 1]] = [copy[swapIndex + 1]!, copy[swapIndex]!];
            return copy;
        });
    }, []);

    useEffect(() => {
        const interval = setInterval(swapAdjacent, 6500);
        return () => clearInterval(interval);
    }, [swapAdjacent]);

    function triggerReaction(personId: string, iconIndex: number) {
        const newReaction: FloatingReaction = {
            id: Date.now() + Math.random(),
            personId,
            iconIndex,
        };
        setReactions((prev) => [...prev, newReaction]);

        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
        }, 2200);
    }

    const renderReactionButtons = (personId: string) => (
        <div className="flex gap-x-1.5">
            {reactionIcons.map(({ Icon, color }, index) => (
                <div key={index} className="relative w-fit h-fit overflow-visible">
                    <button
                        type="button"
                        title="React"
                        onClick={() => triggerReaction(personId, index)}
                        className="p-1 rounded-full transition-transform duration-150 ease-in-out hover:scale-125 active:scale-90 cursor-pointer"
                    >
                        <Icon size={12} style={{ color }} />
                    </button>
                    <AnimatePresence>
                        {reactions
                            .filter((r) => r.personId === personId && r.iconIndex === index)
                            .map(({ id }) => (
                                <motion.div
                                    key={id}
                                    className="absolute left-1/2 top-1/2 pointer-events-none"
                                    initial={{
                                        opacity: 1,
                                        y: 0,
                                        x: '-50%',
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    animate={{
                                        opacity: 0,
                                        y: -80 - Math.random() * 40,
                                        x: '-50%',
                                        scale: 1 + Math.random() * 0.5,
                                        rotate: Math.random() * 30 - 15,
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 2.2,
                                        ease: [0.23, 1, 0.32, 1],
                                        opacity: { duration: 2.2, ease: 'easeOut' },
                                    }}
                                >
                                    <Icon size={14} style={{ color }} className="drop-shadow-sm" />
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );

    return (
        <section className="hidden md:flex h-auto pb-4 w-60 z-1 flex-col gap-y-2 p-2 px-3 absolute bottom-[10%] left-2 scale-105 -rotate-6 bg-light-alpha rounded-xl ring-1 ring-black/10 shadow-xs shadow-black/5">
            <div className="flex gap-x-1.5 px-1 py-px text-dark-base/80 items-center">
                <FaGamepad size={28} />
                Nocturn
            </div>

            {order.map((person, index) => {
                const isParticipant = person.role === 'participant';

                return (
                    <motion.div
                        key={person.id}
                        layout
                        transition={{ layout: { type: 'spring', stiffness: 200, damping: 28 } }}
                        className={cn(
                            'flex gap-x-2 items-center relative',
                            index === 0 && 'mt-4',
                            isParticipant && 'mt-2 rounded-xl p-1',
                            index === 2 && 'mt-3',
                        )}
                        {...(isParticipant && {
                            animate: {
                                boxShadow: [
                                    '0 0 0 1px rgba(79,70,229,0.3)',
                                    '0 0 0 3px rgba(79,70,229,0.15)',
                                    '0 0 0 1px rgba(79,70,229,0.3)',
                                ],
                            },
                        })}
                        {...(!isParticipant && {
                            animate: { boxShadow: '0 0 0 0px rgba(0,0,0,0)' },
                        })}
                    >
                        <motion.div
                            layout
                            className={cn(
                                'shrink-0 overflow-hidden relative',
                                isParticipant
                                    ? 'h-10 w-10 rounded-[10px] ring-1 ring-alpha'
                                    : 'h-12 w-12 rounded-xl',
                            )}
                        >
                            <Image
                                src={person.avatar}
                                alt={person.name}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </motion.div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-dark-base/80 text-xs font-medium truncate">
                                {person.name}
                            </span>
                            {isParticipant ? (
                                <div className="flex items-center gap-x-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-green-600/80 text-[10px] font-medium">
                                        Playing
                                    </span>
                                </div>
                            ) : (
                                <span className="text-dark-base/40 text-[10px]">Spectator</span>
                            )}
                        </div>

                        {isParticipant ? (
                            <BsThreeDotsVertical className="text-dark-base/10 size-6" />
                        ) : (
                            renderReactionButtons(person.id)
                        )}
                    </motion.div>
                );
            })}
        </section>
    );
}

const chatMessages = [
    { side: 'user' as const, text: 'hey! can you make a quiz on the solar system for my class?' },
    {
        side: 'ai' as const,
        text: 'Of course! What difficulty level should I go with, and how many questions do you need?',
    },
    { side: 'user' as const, text: 'intermediate level, like 8 questions should be good' },
    {
        side: 'ai' as const,
        text: "All set! I've created 8 intermediate questions covering planets, orbits, and the sun.",
    },
    { side: 'user' as const, text: 'oh wait can you throw in a couple about black holes too?' },
    {
        side: 'ai' as const,
        text: 'Added 2 questions on black holes! Your quiz now has 10 questions total.',
    },
    { side: 'user' as const, text: 'perfect, set a 30 second timer on each one' },
    {
        side: 'ai' as const,
        text: 'Done! 30s per question. Your quiz is ready to publish whenever you want.',
    },
];

function MockChat({
    visibleCount,
    revealedText,
}: {
    visibleCount: number;
    revealedText: Set<number>;
}) {
    return (
        <div className="flex-1 min-h-0 flex flex-col gap-y-3 justify-end overflow-hidden py-2 relative">
            <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-white to-transparent z-10 pointer-events-none" />
            {chatMessages.slice(0, visibleCount).map((msg, i) => {
                const isUser = msg.side === 'user';
                const hasText = revealedText.has(i);

                return (
                    <motion.div
                        key={`${msg.text}-${i}`}
                        layout
                        className={cn('flex shrink-0', isUser ? 'justify-end' : 'justify-start')}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            layout: { type: 'spring', stiffness: 200, damping: 28 },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 },
                        }}
                    >
                        <div
                            className={cn(
                                'rounded-lg text-[12px] leading-tight max-w-[80%] px-2.5 py-1.5 overflow-hidden',
                                isUser
                                    ? 'bg-alpha text-light-alpha'
                                    : 'bg-light-base text-dark-base/70',
                            )}
                        >
                            <motion.span
                                className="block"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: hasText ? 1 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {msg.text}
                            </motion.span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function QuizCoverArt({ revealed, shimmer }: { revealed: boolean; shimmer: boolean }) {
    return (
        <div className="h-36 w-full shrink-0 rounded-xl relative overflow-hidden bg-linear-to-br from-[#1e1b4b] via-[#4338ca] to-[#6d5ef0]">
            {/* orbit rings */}
            <div className="absolute -top-20 -right-12 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -top-10 -right-4 h-44 w-44 rounded-full border border-white/15" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-white/5" />

            {/* ringed planet */}
            <div className="absolute right-10 top-7">
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-[#fcd34d] via-[#fb923c] to-[#ea580c] shadow-lg shadow-black/30" />
                <div className="absolute top-1/2 left-1/2 h-4 w-20 -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-[100%] border-2 border-white/35" />
            </div>

            {/* moon + stars */}
            <div className="absolute right-32 top-16 h-3 w-3 rounded-full bg-indigo-200/70" />
            <div className="absolute left-10 top-6 h-1 w-1 rounded-full bg-white/70" />
            <div className="absolute left-24 top-14 h-0.5 w-0.5 rounded-full bg-white/50" />
            <div className="absolute left-40 top-4 h-1 w-1 rounded-full bg-white/40" />
            <div className="absolute left-56 top-20 h-0.5 w-0.5 rounded-full bg-white/60" />
            <div className="absolute right-20 bottom-8 h-1 w-1 rounded-full bg-white/50" />

            <div className="absolute bottom-3 left-3.5 right-3.5 flex flex-col gap-y-1.5 items-start">
                <span className="flex items-center gap-x-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
                    <HiSparkles size={9} />
                    AI generated
                </span>
                <AnimatePresence mode="wait">
                    {revealed ? (
                        <motion.span
                            key="title"
                            className="text-white text-xl font-semibold leading-none"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            Solar System Explorer
                        </motion.span>
                    ) : (
                        <motion.span
                            key="skeleton"
                            className="h-5 w-40 rounded-md bg-white/15 animate-pulse"
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {shimmer && (
                    <motion.div
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function QuizQuestionCard({
    index,
    question,
    options,
    correctIndex,
    showTimer,
}: {
    index: number;
    question: string;
    options: string[];
    correctIndex: number;
    showTimer: boolean;
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full shrink-0 rounded-xl bg-light-alpha ring-1 ring-black/5 shadow-xs shadow-black/5 p-2.5 flex flex-col gap-y-2"
        >
            <div className="flex items-center justify-between gap-x-2">
                <div className="flex items-center gap-x-1.5 min-w-0">
                    <span className="h-4.5 w-4.5 shrink-0 rounded-md bg-alpha/10 text-alpha text-[9px] font-semibold flex items-center justify-center">
                        {index}
                    </span>
                    <span className="text-dark-base/80 text-[11px] font-medium truncate">
                        {question}
                    </span>
                </div>
                <AnimatePresence>
                    {showTimer && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex shrink-0 items-center gap-x-1 rounded-full bg-light-base px-1.5 py-0.5 text-[9px] font-medium text-dark-base/50"
                        >
                            <FiClock size={9} />
                            30s
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            <div className="flex gap-x-1.5">
                {options.map((option, i) => (
                    <span
                        key={option}
                        className={cn(
                            'flex items-center gap-x-1 rounded-md px-2 py-1 text-[10px]',
                            i === correctIndex
                                ? 'bg-green-500/10 text-green-700 ring-1 ring-green-500/20 font-medium'
                                : 'bg-light-base text-dark-base/50',
                        )}
                    >
                        {i === correctIndex && <FiCheck size={10} />}
                        {option}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

export default function LandingHeroSection() {
    const [visibleCount, setVisibleCount] = useState(0);
    const [revealedText, setRevealedText] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (visibleCount >= chatMessages.length) return;

        const showNext = setTimeout(
            () => {
                setVisibleCount((c) => c + 1);
            },
            visibleCount === 0 ? 400 : 600,
        );
        return () => clearTimeout(showNext);
    }, [visibleCount]);

    useEffect(() => {
        if (visibleCount > 0) {
            const idx = visibleCount - 1;
            const revealDelay = setTimeout(() => {
                setRevealedText((prev) => new Set(prev).add(idx));
            }, 100);
            return () => clearTimeout(revealDelay);
        }
    }, [visibleCount]);

    const quizStage = visibleCount >= 8 ? 3 : visibleCount >= 6 ? 2 : visibleCount >= 4 ? 1 : 0;

    return (
        <div className="h-[90vh] md:h-screen w-full max-w-7xl flex flex-col gap-y-3 pt-24 md:pt-40 px-6 xl:px-0 items-center select-none overflow-hidden">
            <div className="text-4xl md:text-5xl font-semibold max-w-xl text-dark-base text-center">
                Knowledge that pays off
            </div>

            <div className="text-dark-base/60 w-full max-w-2xl text-xl md:text-2xl text-center">
                Nocturn is a real-time quiz app made for people who love learning and friendly
                competition.
            </div>

            <div className="mt-2">
                <JoinQuizButton />
            </div>

            <div className="h-full w-full relative mt-5">
                <LiveActivityCard />

                <div className="absolute bg-light-alpha shadow-xs shadow-black/5 h-140 sm:h-170 lg:h-full w-175 sm:w-200 rounded-xl overflow-hidden ring-1 ring-black/10 left-1/2 -translate-x-1/2 top-0 flex flex-col scale-[0.45] sm:scale-[0.6] lg:scale-100 origin-top">
                    <div className="h-12 w-full shrink-0 flex justify-between items-center border-b border-black/5">
                        <div className="h-12 w-full px-4 flex items-center gap-x-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#FE3A30]" />
                            <div className="h-3 w-3 rounded-full bg-[#FFCC01]" />
                            <div className="h-3 w-3 rounded-full bg-[#66E035]" />

                            <div className="text-dark-base/80 ml-3 text-sm flex items-center gap-x-3 bg-light-base px-3 py-1 rounded-sm">
                                <span className="flex items-center gap-x-1.5">
                                    <IoLockClosedOutline className="size-3 text-dark-base/40" />
                                    nocturn.app
                                </span>
                                <IoCloseOutline className="size-3.5" />
                            </div>
                        </div>

                        <div className="flex gap-x-2 pr-3">
                            <div className="h-7 w-7 rounded-full bg-alpha/10 flex justify-center items-center text-alpha">
                                <VscSymbolStructure />
                            </div>
                        </div>
                    </div>

                    <div className="h-full min-h-0 w-full flex gap-x-3 p-3">
                        <section className="w-[60%] h-full min-h-0 flex flex-col gap-y-2.5">
                            <QuizCoverArt revealed={quizStage >= 1} shimmer={quizStage === 1} />

                            {/* Topic + question count row */}
                            <div className="h-6 w-full shrink-0 flex items-center justify-between px-0.5 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {quizStage >= 1 ? (
                                        <motion.div
                                            key="topics"
                                            className="flex items-center gap-x-1.5"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
                                        >
                                            <div className="h-5 w-5 shrink-0 rounded-md bg-alpha/10 flex items-center justify-center text-alpha">
                                                <HiFire size={11} />
                                            </div>
                                            {['Planets', 'Orbits', 'The Sun'].map((topic) => (
                                                <span
                                                    key={topic}
                                                    className="rounded-full bg-light-base px-2 py-0.5 text-[9px] font-medium text-dark-base/50"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                            <AnimatePresence>
                                                {quizStage >= 2 && (
                                                    <motion.span
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="rounded-full bg-alpha/10 px-2 py-0.5 text-[9px] font-medium text-alpha"
                                                    >
                                                        Black holes
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="skeleton"
                                            className="h-4 w-1/2 bg-light-base rounded-md animate-pulse"
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </AnimatePresence>
                                {quizStage >= 1 && (
                                    <motion.span
                                        key={quizStage >= 2 ? 'count-10' : 'count-8'}
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[10px] text-dark-base/35 shrink-0"
                                    >
                                        {quizStage >= 2 ? '10' : '8'} questions
                                        {quizStage >= 3 && <> &middot; 30s each</>}
                                    </motion.span>
                                )}
                            </div>

                            {/* Question cards */}
                            <div className="flex-1 min-h-0 flex flex-col gap-y-2 overflow-hidden">
                                {quizStage >= 1 ? (
                                    <>
                                        <QuizQuestionCard
                                            index={1}
                                            question="Which planet is known as the Red Planet?"
                                            options={['Venus', 'Mars', 'Jupiter']}
                                            correctIndex={1}
                                            showTimer={quizStage >= 3}
                                        />
                                        {quizStage >= 2 && (
                                            <QuizQuestionCard
                                                index={9}
                                                question="What lies at the heart of most galaxies?"
                                                options={['A nebula', 'A black hole']}
                                                correctIndex={1}
                                                showTimer={quizStage >= 3}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="h-16 w-full shrink-0 bg-light-base rounded-xl animate-pulse" />
                                        <div className="h-16 w-full shrink-0 bg-light-base rounded-xl animate-pulse [animation-delay:150ms]" />
                                    </>
                                )}
                            </div>

                            {/* Action Bar */}
                            <div className="h-9 w-full rounded-lg overflow-hidden shrink-0">
                                <AnimatePresence mode="wait">
                                    {quizStage >= 3 ? (
                                        <motion.div
                                            key="action"
                                            className="h-full w-full flex items-center justify-between px-2"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
                                        >
                                            <div className="flex items-center gap-x-1.5">
                                                <div className="flex -space-x-1.5">
                                                    {people.slice(0, 3).map((p) => (
                                                        <div
                                                            key={p.id}
                                                            className="h-5 w-5 rounded-full ring-1 ring-white overflow-hidden relative"
                                                        >
                                                            <Image
                                                                src={p.avatar}
                                                                alt={p.name}
                                                                fill
                                                                unoptimized
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-dark-base/35 ml-1">
                                                    3 joined
                                                </span>
                                            </div>
                                            <motion.div
                                                className="h-7 px-3 rounded-md bg-alpha text-light-alpha text-[11px] font-medium flex items-center gap-x-1 cursor-default"
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 25,
                                                    delay: 0.2,
                                                }}
                                            >
                                                Publish Quiz
                                                <FiArrowUp size={12} />
                                            </motion.div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="skeleton"
                                            className="h-full w-full bg-light-base rounded-lg animate-pulse"
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        <section className="w-[40%] h-full min-h-0 px-3 py-1.5 flex flex-col overflow-hidden border border-dashed border-alpha rounded-xl">
                            <div className="flex items-center justify-between shrink-0">
                                <div
                                    className={cn(
                                        'text-dark-base/60 font-semibold text-base',
                                        audio.className,
                                    )}
                                >
                                    nocturn
                                </div>
                                <div className="flex items-center gap-x-1 rounded-full bg-light-base px-1.5 py-0.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[9px] text-dark-base/50 font-medium">
                                        AI online
                                    </span>
                                </div>
                            </div>

                            <MockChat visibleCount={visibleCount} revealedText={revealedText} />

                            <div className="min-h-10 w-full shrink-0 flex flex-col justify-between p-2 px-2.5 text-sm rounded-lg ring-1 ring-black/5 shadow-sm shadow-black/5">
                                <div className="w-full flex justify-between items-center gap-x-2">
                                    <div className="h-6 w-6 shrink-0 text-dark-base/70 ring-1 ring-black/5 rounded-full bg-light-base flex justify-center items-center">
                                        <GoPlus />
                                    </div>

                                    <span className="flex-1 text-[11px] text-dark-base/30 truncate">
                                        Ask nocturn to build a quiz&hellip;
                                    </span>

                                    <div className="h-6 w-6 shrink-0 rounded-md bg-alpha text-light-base flex justify-center items-center">
                                        <FiArrowUp />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
