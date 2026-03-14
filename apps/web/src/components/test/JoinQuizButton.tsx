'use client';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { IoCloseOutline } from 'react-icons/io5';
import { RxCross2 } from 'react-icons/rx';
import clsx from 'clsx';
import userQuizAction from '@/lib/backend/base/user-quiz-action';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import z from 'zod';
import { MdOutlineChevronRight } from 'react-icons/md';
import OpacityBackground from '../utility/OpacityBackground';
import { Button } from '../ui/button';

const container: Variants = {
    closed: {
        width: 160,
        backgroundColor: '#4f46e5',
        color: '#f5f5f5',
        transition: { type: 'spring', stiffness: 500, damping: 35 },
    },
    open: {
        width: 320,
        backgroundColor: '#f5f5f5',
        color: '#0a0a0a',
        transition: { type: 'spring', stiffness: 500, damping: 35 },
    },
};

const closeBtn: Variants = {
    closed: { scale: 0, rotate: -90, opacity: 0 },
    open: {
        scale: 1,
        rotate: 0,
        opacity: 1,
        transition: { delay: 0.1, type: 'spring', stiffness: 500, damping: 35 },
    },
};

function JoinQuizOverlay({
    onClose,
    onJoin,
    name,
    setName,
    email,
    setEmail,
    loading,
}: {
    name: string;
    email: string | null;
    loading: boolean;
    onClose: () => void;
    onJoin: (email: string, name?: string) => void;
    setName: (v: string) => void;
    setEmail: (v: string | null) => void;
}) {
    const [validation, setValidation] = useState<{ message: string; valid: boolean } | null>(null);
    const timeOutRef = useRef<NodeJS.Timeout | null>(null);

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;
        setEmail(value);
        if (!value) {
            setValidation(null);
            return;
        }
        debounceZodCheck(value);
    }

    function debounceZodCheck(value: string) {
        if (timeOutRef.current) clearTimeout(timeOutRef.current);
        timeOutRef.current = setTimeout(() => {
            const parsed = z.email().safeParse(value);
            setValidation(
                parsed.success
                    ? { message: 'Looks good!', valid: true }
                    : { message: 'Please enter a valid email address.', valid: false },
            );
        }, 800);
    }

    return (
        <OpacityBackground onBackgroundClick={onClose} className="bg-neutral-900/20">
            <motion.section
                initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative bg-light-alpha dark:bg-dark-base border-2 border-black w-100 max-w-[90vw] rounded-md overflow-hidden shadow-sm"
            >
                <div className="bg-ndarkest border-b-2 border-black relative h-40 w-full">
                    <Image
                        src="/images/landing/buttonPressGreen.png"
                        alt="join quiz"
                        className="object-cover"
                        fill
                        unoptimized
                    />
                    <motion.button
                        type="button"
                        aria-label="Close modal"
                        onClick={onClose}
                        className="text-ndarkest cursor-pointer absolute right-3 top-3 bg-nlighter rounded-full p-1 hover:bg-ndarkest hover:text-nlighter shadow-xs transition-colors duration-250 z-10"
                    >
                        <RxCross2 size={15} strokeWidth={0.8} />
                    </motion.button>
                </div>

                <section className="p-6 flex flex-col gap-y-5 text-dark-alpha dark:text-light-base">
                    <div>
                        <div className="text-xl font-bold text-dark-alpha/80 dark:text-light-base/80">
                            Join the quiz
                        </div>
                        <p className="text-xs text-dark-alpha/50 dark:text-light-base/50 mt-0.5">
                            Enter your details to participate
                        </p>
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <Label htmlFor="participant-name" className="text-sm font-semibold ml-0.5">
                            Name <span className="text-neutral-400 font-normal">(optional)</span>
                        </Label>
                        <Input
                            id="participant-name"
                            placeholder="What should we call you?"
                            disabled={loading}
                            className="bg-light-base border-none p-5 mt-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-y-1">
                        <Label
                            htmlFor="participant-email"
                            className="text-sm font-semibold ml-0.5 flex items-center gap-x-1"
                        >
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="participant-email"
                            disabled={loading}
                            placeholder="youremail@example.com"
                            className="bg-light-base border-none p-5 mt-1"
                            value={email ?? ''}
                            onChange={handleEmailChange}
                        />
                        <span className="text-[10px] tracking-wide text-dark-base/35 mt-1 ml-0.5">
                            shared with host only · used for prize distribution
                        </span>
                        {validation && email && (
                            <span
                                className={`text-xs ml-0.5 mt-1 text-right ${validation.valid ? 'text-green-500' : 'text-red-500'}`}
                            >
                                {validation.message}
                            </span>
                        )}
                    </div>

                    <Button
                        disabled={!validation?.valid || !email || loading}
                        onClick={() =>
                            email && validation?.valid && onJoin(email, name.trim() || undefined)
                        }
                        className="bg-dark-alpha text-light-alpha hover:bg-dark-base cursor-pointer disabled:bg-neutral-700 disabled:opacity-100! w-full p-5"
                    >
                        {loading ? 'Joining...' : 'Join quiz'}
                        <MdOutlineChevronRight />
                    </Button>
                </section>
            </motion.section>
        </OpacityBackground>
    );
}

function JoinQuizPill({
    isOpen,
    code,
    loading,
    onOpen,
    onClose,
    onCodeChange,
    onJoin,
}: {
    isOpen: boolean;
    code: string;
    loading: boolean;
    onOpen: () => void;
    onClose: () => void;
    onCodeChange: (value: string) => void;
    onJoin: () => void;
}) {
    return (
        <motion.div
            variants={container}
            animate={isOpen ? 'open' : 'closed'}
            initial="closed"
            onClick={!isOpen ? onOpen : undefined}
            className={clsx(
                'relative flex items-center rounded-full h-13 px-2 overflow-hidden',
                'ring-1 ring-black/10 shadow-sm backdrop-blur-sm',
            )}
        >
            <motion.div
                variants={closeBtn}
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                className="absolute right-4 h-6 w-6 rounded-full bg-black text-light-base flex items-center justify-center hover:opacity-70 z-10 cursor-pointer"
            >
                <IoCloseOutline size={17} />
            </motion.div>

            {loading ? (
                <div className="h-10 w-10 flex items-center justify-center shrink-0">
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <motion.div
                    animate={{ x: isOpen ? 2 : 0, backgroundColor: isOpen ? '#4f46e5' : '#f5f5f5' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    onClick={
                        isOpen
                            ? (e) => {
                                  e.stopPropagation();
                                  onJoin();
                              }
                            : undefined
                    }
                    className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ color: isOpen ? '#f5f5f5' : '#0a0a0a' }}
                >
                    <IoIosArrowForward size={18} />
                </motion.div>
            )}

            <div className="flex-1 pl-3.5 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    {isOpen ? (
                        <motion.input
                            key="input"
                            value={code}
                            onChange={(e) => onCodeChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onJoin()}
                            placeholder="Enter code"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.001 }}
                            className="bg-transparent outline-none w-full text-[15px] placeholder:text-neutral-400"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <motion.div
                            key="text"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.001 }}
                            className="whitespace-nowrap font-normal text-[18px]"
                        >
                            Join Quiz
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default function JoinQuizButton() {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string | null>(null);
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    function handleJoinQuiz() {
        if (!code.trim()) return;

        const type =
            code.trim().length === 12
                ? 'participant'
                : code.trim().length === 6
                  ? 'spectator'
                  : null;
        if (!type) return;

        if (type === 'participant') {
            setStep(2);
        } else if (type === 'spectator') {
            makeBackendCall();
        }
    }

    async function makeBackendCall(email?: string, _name?: string) {
        if (!code.trim()) return;
        setLoading(true);
        try {
            const quizId = await userQuizAction.joinQuiz(code.trim(), email, name);
            setCode('');

            console.log('quiz-id: ', quizId);
            if (!quizId) return;
            router.push(`/live/${quizId}`);
        } catch (err) {
            console.error('Failed to join quiz', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ scale: 0.7, opacity: 0, filter: 'blur(6px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="cursor-pointer select-none scale-95"
        >
            {step === 2 ? (
                <JoinQuizOverlay
                    onJoin={(email, name) => makeBackendCall(email, name)}
                    onClose={() => {
                        setStep(0);
                        setCode('');
                    }}
                    name={name}
                    setName={setName}
                    loading={loading}
                    email={email}
                    setEmail={setEmail}
                />
            ) : (
                <JoinQuizPill
                    isOpen={step === 1}
                    code={code}
                    loading={loading}
                    onOpen={() => setStep(1)}
                    onClose={() => {
                        setStep(0);
                        setCode('');
                    }}
                    onCodeChange={setCode}
                    onJoin={handleJoinQuiz}
                />
            )}
        </motion.div>
    );
}
