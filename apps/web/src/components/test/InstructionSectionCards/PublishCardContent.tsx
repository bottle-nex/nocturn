'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

const flipTransition = {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] as const,
};

const containerVariants = {
    initial: {
        transition: {
            staggerChildren: 0.18,
            staggerDirection: -1,
        },
    },
    hover: {
        transition: {
            staggerChildren: 0.18,
            staggerDirection: 1,
        },
    },
};

const rowVariants = {
    initial: {
        rotateX: 0,
        transition: flipTransition,
    },
    hover: {
        rotateX: 180,
        transition: flipTransition,
    },
};

export function PublishCardContent(): React.JSX.Element {
    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            whileHover="hover"
            className={cn(
                'w-55 h-55 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl',
                'bg-light-alpha shrink-0 flex flex-col justify-around',
                'relative overflow-hidden p-5 px-6',
                'transition-all duration-300 hover:-translate-y-1.5 hover:scale-105',
            )}
            style={{ perspective: 1200 }}
        >
            <motion.div
                variants={rowVariants}
                className="relative w-full h-10"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* front */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-sm ring-1 ring-black/10',
                        'shadow-xs shadow-black/5 px-5 flex items-center justify-center',
                        'bg-light-alpha',
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-2 w-full bg-indigo-500 rounded-full" />
                </div>

                {/* back */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-[6px]',
                        'flex items-center gap-x-2 px-2',
                        'bg-indigo-200 text-base tracking-wide text-neutral-700',
                        'ring-1 ring-indigo-400',
                    )}
                    style={{
                        transform: 'rotateX(180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {/* <div className="h-6 w-6 flex items-center justify-center shrink-0">
                        <LuSave className="h-3.5 w-3.5 text-indigo-600" />
                    </div> */}

                    <div className="flex-1 h-6 text-indigo-600 text-sm flex items-center px-3 justify-center">
                        SAVE DRAFT
                    </div>
                </div>
            </motion.div>

            {/* PUBLISH QUIZ */}
            <motion.div
                variants={rowVariants}
                className="relative w-full h-10"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div
                    className={cn(
                        'absolute inset-0 rounded-sm ring-1 ring-black/10',
                        'shadow-xs shadow-black/5 px-5 flex items-center justify-center',
                        'bg-light-alpha',
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-2 w-full bg-red-500 rounded-full" />
                </div>

                <div
                    className={cn(
                        'absolute inset-0 rounded-[6px]',
                        'flex items-center gap-x-2 px-2',
                        'bg-red-100 text-sm tracking-wide text-neutral-700',
                        'ring-1 ring-red-400/80',
                    )}
                    style={{
                        transform: 'rotateX(180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {/* <div className="h-6 w-6 flex items-center justify-center shrink-0">
                        <LuSave className="h-3.5 w-3.5 text-indigo-600" />
                    </div> */}

                    <div className="flex-1 h-6 rounded-full text-red-600/80 flex items-center px-3 justify-center text-sm">
                        PUBLISH QUIZ
                    </div>
                </div>
            </motion.div>

            {/* LAUNCH QUIZ */}
            <motion.div
                variants={rowVariants}
                className="relative w-full h-10"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div
                    className={cn(
                        'absolute inset-0 rounded-sm ring-1 ring-black/10',
                        'shadow-xs shadow-black/5 px-5 flex items-center justify-center',
                        'bg-light-alpha',
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-2 w-full bg-amber-500 rounded-full" />
                </div>

                <div
                    className={cn(
                        'absolute inset-0 rounded-[6px]',
                        'flex items-center gap-x-2 px-2',
                        'bg-amber-100 text-sm tracking-wide text-neutral-700',
                        'ring-1 ring-amber-400',
                    )}
                    style={{
                        transform: 'rotateX(180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    <div className="flex-1 h-6 rounded-full text-amber-600 flex items-center px-3 justify-center text-sm">
                        LAUNCH QUIZ
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
