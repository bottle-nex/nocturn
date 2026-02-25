'use client';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useState } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { IoCloseOutline } from 'react-icons/io5';
import clsx from 'clsx';
import userQuizAction from '@/lib/backend/base/user-quiz-action';
import { useRouter } from 'next/navigation';

const container: Variants = {
    closed: {
        width: 160,
        transition: { type: 'spring', stiffness: 260, damping: 22 },
    },
    open: {
        width: 320,
        transition: { type: 'spring', stiffness: 260, damping: 22 },
    },
};

const text: Variants = {
    closed: { opacity: 1, x: 0 },
    open: { opacity: 0, x: -20 },
};

const input: Variants = {
    closed: { opacity: 0, x: 25 },
    open: { opacity: 1, x: 0 },
};

const closeBtn: Variants = {
    closed: { scale: 0, rotate: -90, opacity: 0 },
    open: {
        scale: 1,
        rotate: 0,
        opacity: 1,
        transition: { delay: 0.18, type: 'spring', stiffness: 300 },
    },
};

export default function JoinQuizButton() {
    const [open, setOpen] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');
    const [loading, _setLoading] = useState<boolean>(false);
    const router = useRouter();

    async function handleJoinQuiz() {
        if (!code.trim()) return;

        try {
            const quizId = await userQuizAction.joinQuiz(code.trim());
            setCode('');

            if (!quizId) return;
            router.push(`/live/${quizId}`);
        } catch (err) {
            console.error('Failed to join quiz', err);
        }
    }

    return (
        <motion.div
            initial={{
                scale: 0.7,
                opacity: 0,
                filter: 'blur(6px)',
            }}
            animate={{
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
            }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
            }}
            onClick={() => !open && setOpen(true)}
            className="cursor-pointer select-none scale-95"
        >
            <motion.div
                variants={container}
                animate={open ? 'open' : 'closed'}
                initial="closed"
                className={clsx(
                    'relative flex items-center rounded-full h-13 px-2 overflow-hidden',
                    'ring-1 ring-black/10 shadow-sm backdrop-blur-sm',
                    open ? 'bg-light-base text-black' : 'bg-alpha text-light-base',
                )}
            >
                <motion.div
                    variants={closeBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                    }}
                    className="absolute right-4 h-6 w-6 rounded-full bg-black text-light-base flex items-center justify-center hover:opacity-70 z-10"
                >
                    <IoCloseOutline size={17} />
                </motion.div>

                {loading ? (
                    <div className="h-10 w-10 flex items-center justify-center">
                        <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <motion.div
                        layout
                        animate={{ x: open ? 2 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (open) handleJoinQuiz();
                        }}
                        className={clsx(
                            'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                            open ? 'bg-alpha text-light-base' : 'bg-light-base text-black',
                        )}
                    >
                        <IoIosArrowForward size={18} />
                    </motion.div>
                )}

                <div className="flex-1 pl-3.5">
                    <AnimatePresence mode="wait">
                        {!open ? (
                            <motion.div
                                key="text"
                                variants={text}
                                initial="closed"
                                animate="closed"
                                exit="open"
                                className="whitespace-nowrap font-normal text-[18px] flex"
                            >
                                Join Quiz
                            </motion.div>
                        ) : (
                            <motion.input
                                key="input"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoinQuiz()}
                                placeholder="Enter code"
                                variants={input}
                                initial="closed"
                                animate="open"
                                exit="closed"
                                className="bg-transparent outline-none w-full text-[15px] placeholder:text-neutral-400"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
