'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline } from 'react-icons/io5';
import { VscSymbolStructure } from 'react-icons/vsc';
import JoinQuizButton from '../test/JoinQuizButton';
import { cn } from '@/lib/utils';
import { audio } from '../test/LandingFooter';
import { GoPlus } from 'react-icons/go';
import { FiArrowUp } from 'react-icons/fi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaHeart } from 'react-icons/fa6';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';
import { FaGamepad } from 'react-icons/fa';
import { HiFire } from 'react-icons/hi2';
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
                        className="p-1 rounded-sm bg-white border-2 border-black shadow-[2px_2px_0_0_#000] transition-all duration-150 ease-in-out hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
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
        <section className="hidden md:flex h-auto pb-4 w-60 z-1 flex-col gap-y-2 p-2 px-3 absolute bottom-[10%] left-2 scale-105 -rotate-6 bg-[#FFF4D6] rounded-lg border-[3px] border-black shadow-[6px_6px_0_0_#000]">
            <div className="flex gap-x-1.5 px-2 py-0.5 -mx-1 items-center justify-between text-dark-base font-bold border-b-[3px] border-black">
                <span className="flex items-center gap-x-1.5">
                    <FaGamepad size={24} />
                    Nocturn
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider bg-[#FF6B6B] text-black border-2 border-black px-1.5 py-px rounded-sm">
                    Live
                </span>
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
                            isParticipant &&
                                'mt-2 rounded-md p-1 bg-[#B8F2D0] border-2 border-black shadow-[3px_3px_0_0_#000]',
                            index === 2 && 'mt-3',
                        )}
                    >
                        <motion.div
                            layout
                            className={cn(
                                'shrink-0 overflow-hidden relative border-2 border-black',
                                isParticipant ? 'h-10 w-10 rounded-md' : 'h-12 w-12 rounded-md',
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
                            <span className="text-dark-base text-xs font-bold truncate">
                                {person.name}
                            </span>
                            {isParticipant ? (
                                <div className="flex items-center gap-x-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-600 border border-black animate-pulse" />
                                    <span className="text-dark-base text-[10px] font-semibold">
                                        Playing
                                    </span>
                                </div>
                            ) : (
                                <span className="text-dark-base/60 text-[10px] font-medium">
                                    Spectator
                                </span>
                            )}
                        </div>

                        {isParticipant ? (
                            <BsThreeDotsVertical className="text-dark-base/60 size-5" />
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
            <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-[#FFE1EC] to-transparent z-10 pointer-events-none" />
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
                                'rounded-md text-[12px] leading-tight max-w-[80%] px-2.5 py-1.5 overflow-hidden border-2 border-black shadow-[3px_3px_0_0_#000] font-medium',
                                isUser ? 'bg-alpha text-light-alpha' : 'bg-white text-dark-base',
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
        <div className="relative isolate h-[90vh] md:h-screen w-full max-w-270 flex flex-col gap-y-3 pt-24 md:pt-36 px-6 xl:px-0 items-center select-none overflow-hidden">
            {/* Dotted grid backdrop, faded towards the edges */}
            <div
                aria-hidden
                className="absolute inset-0 -z-10 pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black_35%,transparent_75%)]"
                style={{
                    backgroundImage: 'radial-gradient(#161616 1.2px, transparent 1.2px)',
                    backgroundSize: '22px 22px',
                    opacity: 0.18,
                }}
            />

            {/* Floating stickers */}
            <div
                aria-hidden
                className="hidden lg:flex absolute top-36 left-6 -rotate-12 items-center gap-x-1.5 bg-[#B8F2D0] border-[3px] border-black shadow-[4px_4px_0_0_#000] rounded-md px-3 py-1.5 text-sm font-black text-black"
            >
                <HiFire size={16} />
                +120 pts
            </div>
            <div
                aria-hidden
                className="hidden lg:flex absolute top-52 right-8 rotate-[10deg] items-center gap-x-1.5 bg-[#FF8FB1] border-[3px] border-black shadow-[4px_4px_0_0_#000] rounded-md px-3 py-1.5 text-sm font-black text-black"
            >
                <FaHeart size={14} />
                Streak x5
            </div>

            <div className="flex items-center gap-x-2 bg-white border-2 border-black shadow-[3px_3px_0_0_#000] rounded-full px-3 py-1 text-xs md:text-sm font-bold text-dark-base">
                <span className="h-2 w-2 rounded-full bg-[#FF6B6B] border border-black animate-pulse" />
                Real-time quizzes, live leaderboards
            </div>

            <h1 className="mt-2 text-4xl md:text-6xl font-black tracking-tight max-w-3xl text-dark-base text-center leading-[1.1]">
                Knowledge that{' '}
                <span className="relative inline-block whitespace-nowrap -rotate-2 bg-[#FFD84D] border-[3px] border-black shadow-[5px_5px_0_0_#000] rounded-md px-3 md:px-4 py-0.5 mt-2">
                    pays off
                </span>
            </h1>

            <p className="mt-3 text-dark-base/80 font-medium w-full max-w-2xl text-lg md:text-2xl text-center">
                Nocturn is a real-time quiz app made for people who love learning and friendly
                competition.
            </p>

            <div className="mt-2">
                <JoinQuizButton />
            </div>

            <div className="h-full w-full relative mt-5">
                <LiveActivityCard />

                <div className="absolute bg-white h-140 sm:h-170 lg:h-full w-175 sm:w-200 rounded-lg overflow-hidden border-[3px] border-black shadow-[10px_10px_0_0_#000] left-1/2 -translate-x-1/2 top-0 flex flex-col scale-[0.45] sm:scale-[0.6] lg:scale-100 origin-top">
                    <div className="h-12 w-full flex justify-between items-center bg-[#FFD84D] border-b-[3px] border-black shrink-0">
                        <div className="h-12 w-full px-4 flex items-center gap-x-1.5">
                            <div className="h-3.5 w-3.5 rounded-full bg-[#FE3A30] border-2 border-black" />
                            <div className="h-3.5 w-3.5 rounded-full bg-[#FFCC01] border-2 border-black" />
                            <div className="h-3.5 w-3.5 rounded-full bg-[#66E035] border-2 border-black" />

                            <div className="text-dark-base font-bold ml-3 text-sm flex items-center gap-x-3 bg-white border-2 border-black px-3 py-0.5 rounded-sm">
                                nocturn.app
                                <IoCloseOutline className="size-3.5" />
                            </div>
                        </div>

                        <div className="flex gap-x-2 pr-3">
                            <div className="h-7 w-7 rounded-md bg-white border-2 border-black shadow-[2px_2px_0_0_#000] flex justify-center items-center text-alpha">
                                <VscSymbolStructure />
                            </div>
                        </div>
                    </div>

                    <div className="h-full min-h-0 w-full flex gap-x-3 p-3">
                        <section className="w-[60%] h-full flex flex-col gap-y-3">
                            <div className="h-50 w-full rounded-md border-[3px] border-black bg-light-base relative overflow-hidden">
                                <Image
                                    src="/images/hero-img.jpg"
                                    alt="Chat preview"
                                    fill
                                    className="object-cover"
                                />
                                <AnimatePresence>
                                    {quizStage === 1 && (
                                        <motion.div
                                            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '100%' }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.8,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Quiz Title Row */}
                            <div className="h-8 w-full flex items-center justify-between px-1 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {quizStage >= 1 ? (
                                        <motion.div
                                            key="title"
                                            className="flex items-center justify-between w-full"
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{
                                                duration: 0.5,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="h-6 w-6 shrink-0 rounded-sm bg-[#FF8FB1] border-2 border-black flex items-center justify-center text-black">
                                                    <HiFire size={13} />
                                                </div>
                                                <span className="text-dark-base text-[13px] font-black">
                                                    Solar System Explorer
                                                </span>
                                            </div>
                                            <span className="text-dark-base text-[10px] font-bold bg-[#B8F2D0] border-2 border-black rounded-sm px-1.5 py-px">
                                                10 questions &middot; 30s
                                            </span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="skeleton"
                                            className="h-5 w-3/4 bg-light-base border-2 border-black/20 rounded-sm animate-pulse"
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Action Bar */}
                            <div className="h-10 w-full rounded-md overflow-hidden shrink-0">
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
                                                            className="h-5 w-5 rounded-full border-2 border-black overflow-hidden relative"
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
                                                <span className="text-[10px] font-bold text-dark-base ml-1">
                                                    3 joined
                                                </span>
                                            </div>
                                            <motion.div
                                                className="h-7 px-3 rounded-sm bg-alpha text-light-alpha text-[11px] font-bold border-2 border-black shadow-[3px_3px_0_0_#000] flex items-center gap-x-1 cursor-default"
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
                                            className="h-full w-full bg-light-base border-2 border-black/20 rounded-md animate-pulse"
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>

                        <section className="w-[40%] h-full min-h-0 px-3 py-1.5 flex flex-col overflow-hidden bg-[#FFE1EC] border-[3px] border-black rounded-md">
                            <div
                                className={cn(
                                    'text-dark-base font-bold text-base shrink-0',
                                    audio.className,
                                )}
                            >
                                nocturn
                            </div>

                            <MockChat visibleCount={visibleCount} revealedText={revealedText} />

                            <div className="min-h-10 w-full shrink-0 flex flex-col justify-between p-2 px-2.5 mb-1.5 text-sm rounded-md bg-white border-2 border-black shadow-[3px_3px_0_0_#000]">
                                <div className="w-full flex justify-between items-center">
                                    <div className="h-6 w-6 text-dark-base border-2 border-black rounded-sm bg-[#FFD84D] flex justify-center items-center">
                                        <GoPlus />
                                    </div>

                                    <div className="h-6 w-6 rounded-sm bg-alpha text-light-base border-2 border-black flex justify-center items-center">
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
