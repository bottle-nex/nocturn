'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IoIosArrowForward } from 'react-icons/io';
import AnimatedSvg from '../svgs/all-svgs';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { SplitText } from 'gsap/SplitText';
import { IoCloseOutline } from 'react-icons/io5';
import userQuizAction from '@/lib/backend/base/user-quiz-action';
import { useRouter } from 'next/navigation';
import { closeBtn, container, input, text } from '../utility/framer-utils/LandingHeroSectionUtils';
import Lottie from 'lottie-react';
import monitor from '../ui/animated-icons/animated-json/monitor.json';
import LandingSectionBigTextComponent from './LandingSectionBigTextComponent';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(TextPlugin, SplitText);
}

export default function LandingSection() {
    const descriptionRef = useRef<HTMLDivElement>(null);
    const taglineRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [quizCode, setQuizCode] = useState<string>('');
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const master = gsap.timeline({ delay: 0.2 });

        if (taglineRef.current) {
            const split = new SplitText(taglineRef.current, { type: 'words,chars' });

            gsap.set(split.chars, {
                opacity: 0,
                y: 10,
                filter: 'blur(6px)',
            });

            master.to(
                split.chars,
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.5,
                    ease: 'power2.out',
                    stagger: 0.02,
                },
                1.5,
            );
        }

        if (descriptionRef.current) {
            const words = descriptionRef.current.textContent?.split(' ') || [];

            descriptionRef.current.innerHTML = words
                .map((word) => `<span class="word">${word}</span> `)
                .join('');

            const wordElements = descriptionRef.current.querySelectorAll('.word');

            gsap.set(wordElements, { opacity: 0, y: 10 });

            master.to(
                wordElements,
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.02,
                },
                1.8,
            );
        }
    }, []);

    async function handleJoinQuiz() {
        if (!quizCode.trim() || loading) return;

        try {
            setLoading(true);
            const quizId = await userQuizAction.joinQuiz(quizCode.trim());
            setQuizCode('');

            if (!quizId) return;
            router.push(`/live/${quizId}`);
        } catch (err) {
            console.error('Failed to join quiz', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen w-screen bg-light-alpha flex flex-col pt-24 px-8 relative">
            {/* animated object */}
            {/* <div className="absolute top-[29.5rem] right-50">
                <AnimatedSvg />
            </div> */}
            <div className="absolute left-[28%] bottom-3 w-[200px] h-[200px] scale-x-[-1]">
                <Lottie animationData={monitor} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* top small text */}
            <div className="flex -space-x-58 w-fit">
                <div className="mt-1">
                    <AnimatedSvg />
                </div>
                <motion.div
                    initial={{
                        scale: 0.6,
                        opacity: 0,
                        x: 0,
                    }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 550,
                        damping: 18,
                        mass: 0.6,
                    }}
                    style={{ fontWeight: 900 }}
                    className={cn(
                        'flex flex-col text-alpha text-[1.7rem] leading-none font-extrabold tracking-normal font-sans',
                    )}
                >
                    <div className="small-line">THE ULTIMATE</div>
                    <div className="small-line">STAKE QUIZ</div>
                </motion.div>
            </div>

            {/* big text section middle */}
            <LandingSectionBigTextComponent />

            <div className="flex w-full h-full py-10">
                <div className="w-1/2 h-full" />

                {/* bottom text area */}
                <div className="w-2/3 h-full flex flex-col text-dark-alpha justify-end text-[1.2rem] max-w-md gap-y-0.5">
                    <div
                        ref={taglineRef}
                        style={{ fontWeight: 800 }}
                        className="font-sans uppercase flex gap-x-1"
                    >
                        <div className="">Are you ready to</div>
                        <div className="italic text-alpha">stake your SOL?</div>
                    </div>

                    <div ref={descriptionRef} className="leading-[1.3] max-w-md">
                        Join our stake-based quiz experience and challenge your knowledge while
                        competing for real rewards. Test your skills, make your moves, and see if
                        you can top the leaderboard.
                    </div>
                </div>

                {/* join buttoin */}
                <div className="w-1/3 h-full flex items-end justify-end">
                    <motion.div
                        onClick={() => !open && setOpen(true)}
                        className="cursor-pointer"
                        initial={{ x: 80, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            delay: 2.1,
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <motion.div
                            variants={container}
                            animate={open ? 'open' : 'closed'}
                            initial={false}
                            className={cn(
                                'ring-1 ring-black/10 shadow-xs shadow-black/5',
                                'rounded-full flex items-center px-2 h-12 overflow-hidden relative',
                                open ? 'bg-light-base' : 'bg-alpha',
                            )}
                        >
                            {/* close button */}
                            <motion.div
                                variants={closeBtn}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpen(false);
                                }}
                                className="absolute right-3 h-6 w-6 rounded-full bg-dark-base text-light-alpha flex justify-center items-center hover:bg-dark-faded transition-colors transform duration-200 z-5 active:scale-95"
                            >
                                <IoCloseOutline />
                            </motion.div>

                            {/* loader */}
                            {loading ? (
                                <div className="h-8 w-8 flex items-center justify-center">
                                    <div className="h-5 w-5 border-2 border-light-base rounded-full animate-spin" />
                                </div>
                            ) : (
                                // arrow button
                                <motion.div
                                    onClick={() => {
                                        if (!open || !quizCode.trim()) return;
                                        handleJoinQuiz();
                                    }}
                                    layout
                                    animate={{ x: open ? 1.5 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className={cn(
                                        'h-8 w-8 rounded-full flex justify-center items-center shrink-0',
                                        open
                                            ? 'bg-alpha text-light-base'
                                            : 'bg-light-base text-dark-base/70',
                                    )}
                                >
                                    <IoIosArrowForward />
                                </motion.div>
                            )}

                            <div className="flex items-center flex-1 pl-3 pr-10 relative">
                                <AnimatePresence mode="wait">
                                    {/* join button component */}
                                    {!open ? (
                                        <motion.div
                                            key="text"
                                            variants={text}
                                            initial="closed"
                                            animate="closed"
                                            transition={{ duration: 0.1 }}
                                            exit="open"
                                            className="whitespace-nowrap"
                                        >
                                            Join Quiz
                                        </motion.div>
                                    ) : (
                                        // input box component
                                        <motion.input
                                            value={quizCode}
                                            onChange={(e) => setQuizCode(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleJoinQuiz();
                                                }
                                            }}
                                            key="input"
                                            autoFocus
                                            placeholder="Enter code"
                                            variants={input}
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            transition={{ duration: 0.25 }}
                                            className="bg-transparent outline-none w-full text-sm text-dark-base"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
