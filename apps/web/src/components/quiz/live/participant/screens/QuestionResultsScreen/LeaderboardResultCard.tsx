'use client';
import { cn } from '@/lib/utils';
import { ParticipantType, QuestionType } from '@/types/prisma-types';
import Image from 'next/image';

export default function LeaderboardResultCard({
    participant,
    currentQuestion,
    userAnswer,
    rank,
    streak,
}: {
    participant: ParticipantType | null;
    currentQuestion: QuestionType | null;
    userAnswer: number | undefined | null;
    rank: number;
    streak: number;
}) {
    const hasAnswered = userAnswer !== undefined;
    const isCorrect = hasAnswered && userAnswer === currentQuestion?.correctAnswer;

    return (
        <div className="w-full max-w-[37rem] mx-auto flex flex-col gap-y-3">
            <div className="w-full">
                <div className="bg-white/7 backdrop-blur-3xl border border-slate-700/40 rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
                    <div className="relative p-3 sm:p-4 lg:p-5 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                                    <Image
                                        src={participant?.avatar ?? '/default-avatar.png'}
                                        alt={participant?.nickname ?? 'Unknown Participant'}
                                        className="w-full h-full object-cover"
                                        width={64}
                                        height={64}
                                        unoptimized
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="w-full text-lg sm:text-xl font-semibold text-white flex items-center gap-x-3 mb-1 truncate">
                                        <div
                                            className={cn(
                                                'relatie z-10 px-3.5 py-1.5 border border-neutral-500 rounded-full ',
                                                'bg-neutral-200 dark:bg-dark-base shadow-md ',
                                                'text-dark-base dark:text-light-base text-xs',
                                            )}
                                        >
                                            <span className="font-semibold">#{rank}</span>
                                        </div>
                                        <div>{participant?.nickname.split(' ')[0]}</div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-[#FFF5F2] rounded-full flex-shrink-0"></div>
                                            <span>Score: {participant?.totalScore || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-[#FFF5F2] rounded-full flex-shrink-0"></div>
                                            <span>Streak: {streak}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5 lg:p-6">
                        <h4 className="text-base sm:text-lg font-medium text-white mb-3 sm:mb-4 leading-relaxed">
                            Q. {currentQuestion?.question || 'This is the current question'}
                        </h4>

                        <div className="space-y-3">
                            <div className="bg-neutral-800/15 border border-neutral-600 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                <div className="flex items-center justify-between text-neutral-300 text-sm sm:text-base">
                                    <span className="font-medium">Correct Answer</span>
                                    <span className="truncate ml-2">
                                        {currentQuestion?.options[currentQuestion?.correctAnswer] ||
                                            ''}
                                    </span>
                                </div>
                            </div>

                            <div
                                className={cn(
                                    isCorrect
                                        ? 'bg-teal-500/15 border-green-400/30'
                                        : 'bg-red-500/5 border-red-400/30',
                                    'border rounded-lg sm:rounded-xl p-3 sm:p-4',
                                )}
                            >
                                {hasAnswered ? (
                                    <div className="flex items-center justify-between text-neutral-300 text-sm sm:text-base">
                                        <span
                                            className={`font-medium ${isCorrect ? 'text-teal-300' : 'text-rose-300'}`}
                                        >
                                            Your Answer
                                        </span>
                                        <span className="truncate ml-2">
                                            {currentQuestion?.options[userAnswer!]}{' '}
                                            {isCorrect ? '✓' : '✗'}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center text-neutral-300 text-sm sm:text-base">
                                        {"You didn't respond"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    'w-full bg-white/7 backdrop-blur-3xl border border-slate-700/40 rounded-lg sm:rounded-xl shadow-2xl overflow-hidden p-3 sm:p-4 lg:px-5 lg:py-4 ',
                    'text-neutral-300 text-left',
                )}
            >
                {currentQuestion?.explanation ? (
                    <div className="text-sm">{currentQuestion?.explanation}</div>
                ) : (
                    <div>No explanation provided</div>
                )}
            </div>
        </div>
    );
}
