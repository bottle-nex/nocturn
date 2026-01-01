import { cn } from '@/lib/utils';
import { QuizType } from '@nocturn/types';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { FaCalendar } from 'react-icons/fa6';
import { SiSolana } from 'react-icons/si';
import QuizStatusTicker from '../tickers/QuizstatusTicker';

export default function HoverCards({
    quizs,
    className,
}: {
    quizs: QuizType[];
    className?: string;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className={cn('w-full max-w-screen-xl mx-auto', className)}>
            <div className={cn('flex flex-wrap items-start w-full gap-4')}>
                {quizs.map((quiz, idx) => (
                    <div
                        key={quiz?.id}
                        className="relative group block p-2 h-full w-full max-w-[calc(33.333%-1rem)] min-h-[12rem]"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <AnimatePresence>
                            {hoveredIndex === idx && (
                                <motion.span
                                    className="absolute inset-0 h-full w-full dark:bg-light-base/40 bg-dark-base/10 block rounded-3xl"
                                    layoutId="hoverBackground"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 1,
                                        transition: { duration: 0.15 },
                                    }}
                                    exit={{
                                        opacity: 0,
                                        transition: { duration: 0.15, delay: 0.2 },
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        <a href={`new/${quiz.id}`} className="block h-full">
                            <Card className="flex flex-col w-full p-6 h-full">
                                <div className="flex items-center justify-between w-full">
                                    <CardTitle className="mt-0 p-0 flex-1 min-w-0">
                                        <span className="break-words">{quiz.title}</span>
                                    </CardTitle>
                                </div>

                                <div className="flex items-center gap-x-4 mt-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                                        <SiSolana className="text-base" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                                            Prize pool
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight">
                                            0 sol
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 ml-2">
                                        <QuizStatusTicker status={quiz.status} />
                                    </div>
                                </div>

                                {quiz.scheduledAt && (
                                    <div className="flex items-center gap-x-4 mt-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                                            <FaCalendar className="text-base" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
                                                Scheduled
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-tight break-words">
                                                {new Date(quiz.scheduledAt).toLocaleDateString(
                                                    'en-US',
                                                    {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const Card = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                'rounded-2xl h-full w-full overflow-hidden dark:bg-[#141414] bg-light-base border border-neutral-300 dark:border-neutral-700 relative z-10 transition-all duration-200 ease-out min-h-[12rem]',
                className,
            )}
        >
            <div className="relative z-10 h-full">
                <div className="h-full">{children}</div>
            </div>
        </div>
    );
};

// ✅ Card title
export const CardTitle = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <h4
            className={cn(
                'dark:text-light-base/90 text-dark-base font-bold tracking-wider mt-4 leading-tight text-balance',
                className,
            )}
        >
            {children}
        </h4>
    );
};

// ✅ Optional description (unused here)
export const CardDescription = ({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) => {
    return (
        <p
            className={cn(
                'mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm break-words',
                className,
            )}
        >
            {children}
        </p>
    );
};
