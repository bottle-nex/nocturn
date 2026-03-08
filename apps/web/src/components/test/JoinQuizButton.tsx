'use client';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { IoIosArrowForward } from 'react-icons/io';
import { IoCloseOutline, IoTrophyOutline } from 'react-icons/io5';
import clsx from 'clsx';
import userQuizAction from '@/lib/backend/base/user-quiz-action';
import { useRouter } from 'next/navigation';
import AppLogo from '../app/AppLogo';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import z from 'zod';
import { MdOutlineChevronRight } from 'react-icons/md';
import OpacityBackground from '../utility/OpacityBackground';
import { Button } from '../ui/button';
import CanvasAccents from '../utility/CanvasAccents';

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

function JoinQuizOverlay({ onClose, onJoin, name, setName, email, setEmail, loading }: {
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
                    : { message: 'Please enter a valid email address.', valid: false }
            );
        }, 800);
    }

    return (
        <OpacityBackground onBackgroundClick={onClose} className='bg-dark-alpha/20 z-20'>
            <main className='relative max-w-7xl w-full rounded-xl mx-auto h-[80dvh] bg-light-alpha z-20 overflow-hidden flex flex-col'>
                <CanvasAccents accentColor='#000000' design='staircase' />
                <AppLogo withText size={120} className='absolute top-0 left-0' />
                <section className='flex flex-1 items-center justify-center w-full z-20'>
                    <div className='max-w-xs w-full flex flex-col gap-y-6'>
                        <div>
                            <Label htmlFor='participant-name' className='text-xs text-dark-base/70 ml-1 mb-1 block'>
                                Name <span className='text-neutral-400'>(optional)</span>
                            </Label>
                            <Input
                                id='participant-name'
                                placeholder="What should we call you?"
                                disabled={loading}
                                className='border-t-0 border-x-0 shadow-none rounded-none placeholder:text-base text-base! w-full placeholder:text-dark-base/70 text-dark-base/70'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor='participant-email' className='text-xs text-dark-base/70 ml-1 mb-1 flex items-center gap-x-1'>
                                Email <span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex items-center justify-center gap-x-2'>
                                <Input
                                    id='participant-email'
                                    disabled={loading}
                                    placeholder="Enter your email to join the quiz"
                                    className='border-t-0 border-x-0 shadow-none rounded-none placeholder:text-base text-base! max-w-2xl w-full placeholder:text-dark-base/70 text-dark-base/70'
                                    value={email ?? ''}
                                    onChange={handleEmailChange}
                                />

                            </div>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex items-center gap-x-1.5 mt-3 ml-1"
                            >
                                {/* <IoTrophyOutline size={10} className="text-alpha shrink-0" /> */}
                                <span className="text-[10px] tracking-wide text-dark-base/35 leading-none">
                                    shared with host only · used for prize distribution
                                </span>
                            </motion.div>
                            {validation && email && (
                                <span className={`text-xs ml-1 block mt-2 text-right ${validation.valid ? 'text-green-500' : 'text-red-500'}`}>
                                    {validation.message}
                                </span>
                            )}
                        </div>
                        <Button disabled={!validation?.valid || !email || loading} onClick={() => email && validation?.valid && onJoin(email, name.trim() || undefined)} className='bg-dark-alpha text-light-alpha hover:bg-dark-base cursor-pointer disabled:bg-dark-base disabled:opacity-100'>
                            {loading ? <span>Joining...</span> : <span>Join quiz</span>}
                            <MdOutlineChevronRight />
                        </Button>
                    </div>
                </section>
            </main>
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
                onClick={(e) => { e.stopPropagation(); onClose(); }}
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
                    onClick={isOpen ? (e) => { e.stopPropagation(); onJoin(); } : undefined}
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

        const type = code.trim().length === 12 ? 'participant' : code.trim().length === 6 ? 'spectator' : null;
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
            const quizId = await userQuizAction.joinQuiz(code.trim(), email);
            setCode('');

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
                    onClose={() => { setStep(0); setCode(''); }}
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
                    onClose={() => { setStep(0); setCode(''); }}
                    onCodeChange={setCode}
                    onJoin={handleJoinQuiz}
                />
            )}
        </motion.div>
    );
}
