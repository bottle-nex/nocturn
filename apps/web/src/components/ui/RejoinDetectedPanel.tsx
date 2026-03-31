'use client';

import OpacityBackground from '@/components/utility/OpacityBackground';
import UtilityCard from '@/components/utility/UtilityCard';
import { cn } from '@/lib/utils';
import { useRejoinPanelStore } from '@/store/base/useRejoinPanelStore';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, X, RefreshCw, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { IoWarningOutline } from 'react-icons/io5';

interface RejoinDetectedPanelProps {
    deny: () => void;
    onJoinAsNew: (code: string) => void;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)' },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        y: 8,
        filter: 'blur(4px)',
        transition: { duration: 0.2, ease: 'easeIn' },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.07 + 0.1, duration: 0.28, ease: [0.16, 1, 0.3, 1] },
    }),
};

export default function RejoinDetectedPanel({ deny, onJoinAsNew }: RejoinDetectedPanelProps) {
    const { description, joinAs, joinBack, joinData, setData, setJoinData, setActive } =
        useRejoinPanelStore();
    const router = useRouter();

    function handleJoinBack() {
        router.push(`/live/${joinBack}`);
        setJoinData(null, null, null);
        setData(null, null, null);
        setActive(false);
    }

    function handleJoinAsNew() {
        const code = joinData.code;
        setData(null, null, null);
        setActive(false);
        setJoinData(null, null, null);
        if (code) onJoinAsNew(code);
    }

    const options = [
        {
            icon: RefreshCw,
            label: 'Rejoin session',
            sub: 'Continue where you left off',
            onClick: handleJoinBack,
            accent: 'group-hover:text-indigo-500',
            iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
            iconColor: 'text-indigo-500',
            border: 'hover:border-indigo-200 dark:hover:border-indigo-500/30',
            bg: 'hover:bg-indigo-50/60 dark:hover:bg-indigo-500/5',
        },
        {
            icon: UserPlus,
            label: joinAs ? `Join as ${joinAs.toLowerCase()}` : 'Join as new participant',
            sub: 'Start fresh with different details',
            onClick: handleJoinAsNew,
            accent: 'group-hover:text-emerald-500 ',
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
            iconColor: 'text-emerald-500',
            border: 'hover:border-emerald-200 dark:hover:border-emerald-500/30',
            bg: 'hover:bg-emerald-50/60 dark:hover:bg-emerald-500/5',
        },
    ];

    return (
        <OpacityBackground className="backdrop-blur-[2px] bg-black/40">
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-md mx-auto"
            >
                <UtilityCard
                    className={cn(
                        'bg-light-base dark:bg-dark-alpha',
                        'border border-neutral-200/80 dark:border-neutral-800',
                        'rounded-xl shadow-2xl shadow-black/10',
                        'flex flex-col relative overflow-hidden',
                    )}
                >
                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />

                    <motion.button
                        onClick={deny}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-all duration-150 cursor-pointer z-10"
                    >
                        <X className="w-3.5 h-3.5" />
                    </motion.button>

                    <motion.div
                        custom={0}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="px-6 pt-6 pb-5"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-amber-500 text-md">
                                    <IoWarningOutline />
                                </span>
                            </div>
                            <div className="flex-1 pr-6 ">
                                <h2 className="text-base text-neutral-900 dark:text-light-base leading-snug ">
                                    Session already active
                                </h2>
                                <p className="text-[12px] text-neutral-500 dark:text-light-base/60 leading-relaxed">
                                    {description ||
                                        'You already have an active session for this quiz.'}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="mx-6 h-px bg-neutral-100 dark:bg-neutral-800/80" />

                    <div className="p-3 flex flex-col gap-1.5">
                        {options.map((opt, i) => (
                            <motion.button
                                key={opt.label}
                                custom={i + 1}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                onClick={opt.onClick}
                                className={cn(
                                    'group flex items-center gap-3.5 text-left w-full',
                                    'bg-dark-base border border-neutral-800',
                                    'rounded-lg px-4 py-3.5',
                                    'transition-all duration-150 cursor-pointer',
                                    opt.border,
                                    opt.bg,
                                )}
                            >
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150',
                                        opt.iconBg,
                                    )}
                                >
                                    <opt.icon className={cn('w-3.5 h-3.5', opt.iconColor)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            'text-[13px] font-medium text-neutral-800 dark:text-neutral-200 transition-colors duration-150',
                                            opt.accent,
                                        )}
                                    >
                                        {opt.label}
                                    </p>
                                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                                        {opt.sub}
                                    </p>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
                            </motion.button>
                        ))}
                    </div>

                    <motion.div
                        custom={3}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="px-6 pb-5 pt-1"
                    >
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-600 text-center">
                            Not sure?{' '}
                            <button
                                onClick={deny}
                                className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors cursor-pointer"
                            >
                                Go back
                            </button>{' '}
                            and try a different code.
                        </p>
                    </motion.div>
                </UtilityCard>
            </motion.div>
        </OpacityBackground>
    );
}
