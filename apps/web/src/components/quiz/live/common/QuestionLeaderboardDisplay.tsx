'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useLeaderboardStore } from '@/store/live-quiz/useLeaderboardStore';
import { barColors } from '../host/screens/QuizResultsScreen/HostQuizResultsScreensRenderer';

interface QuestionLeaderboardDisplayProps {
    showMyRank?: boolean;
    myRank?: number | null;
    myScore?: number | null;
    totalParticipants?: number;
}

export default function QuestionLeaderboardDisplay({
    showMyRank,
    myRank,
    myScore,
    totalParticipants,
}: QuestionLeaderboardDisplayProps) {
    const { topLeaderboard } = useLeaderboardStore();

    const sorted = (topLeaderboard ?? []).map((entry) => ({
        avatar: entry.avatar ?? '/default-avatar.png',
        position: entry.rank,
        name: entry.nickname,
        score: entry.totalScore,
    }));

    const emptyScoreboard = sorted.length === 0 || sorted[0]?.score === 0;

    if (emptyScoreboard) {
        return (
            <div className="h-full w-full flex justify-center items-center text-neutral-500 text-sm">
                No scores to display yet
            </div>
        );
    }

    const topThree = sorted.filter((d) => d.position <= 3);
    const rest = sorted.filter((d) => d.position > 3);
    const maxScore = rest[0]?.score ?? 1;

    const showMyRankFooter = showMyRank && myRank && myRank > topLeaderboard.length;

    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar pt-6" data-lenis-prevent>
            <div className="flex items-center justify-center gap-x-10 pt-10 pb-6">
                {[...topThree]
                    .sort(
                        (a, b) =>
                            (a.position % 2) - (b.position % 2) || a.position - b.position,
                    )
                    .map((item) => (
                        <div
                            key={item.position}
                            className={cn(
                                'relative',
                                item.position === 1 && '-translate-y-6',
                            )}
                        >
                            {item.position === 1 && (
                                <Image
                                    alt="crown"
                                    src="/images/crown.png"
                                    width={60}
                                    height={60}
                                    className="absolute -top-11 -rotate-20"
                                />
                            )}
                            <Image
                                src={item.avatar}
                                alt={`Position ${item.position}`}
                                width={80}
                                height={80}
                                className="rounded-full"
                            />
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-xs font-semibold text-neutral-800 aspect-square flex items-center justify-center">
                                <span className="block text-center font-bold">
                                    #{item.position}
                                </span>
                            </div>
                            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-center text-lg! font-normal text-dark-faded">
                                <span className="block text-black truncate max-w-24">
                                    {item.name.split(' ')[0]}
                                </span>
                                <span className="block text-sm text-dark-faded/80">
                                    {item.score}
                                </span>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="px-8 pb-8 flex flex-col gap-y-0 max-w-4xl mx-auto mt-10">
                {rest.map((item, index) => {
                    const barWidthPercent = (item.score / maxScore) * 90;
                    return (
                        <div key={item.position} className="flex items-center gap-x-3">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.04 + 0.6,
                                    ease: 'easeOut',
                                }}
                                className="text-lg font-bold text-neutral-700 w-20 text-right shrink-0"
                            >
                                {item.score.toLocaleString()} p
                            </motion.span>
                            <div className="flex-1 flex items-center min-w-0">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidthPercent}%` }}
                                    transition={{
                                        duration: 0.8,
                                        delay: index * 0.04,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="h-10 rounded-r-full shrink-0"
                                    style={{
                                        backgroundColor:
                                            barColors[index % barColors.length],
                                    }}
                                />
                                <div className="relative w-11 h-11 shrink-0 -translate-x-8 rounded-full bg-white border-2 border-white">
                                    <Image
                                        src={item.avatar}
                                        alt={item.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <span className="text-lg font-semibold text-neutral-800 shrink-0 w-28 text-nowrap truncate">
                                    {item.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showMyRankFooter && (
                <div className="sticky bottom-0 w-full bg-white/90 backdrop-blur-sm border-t border-neutral-200 px-6 py-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-600">Your Rank</span>
                    <span className="text-sm font-bold text-neutral-800">
                        #{myRank} / {totalParticipants}
                        {myScore != null && (
                            <span className="ml-2 text-neutral-500 font-normal">
                                {myScore.toLocaleString()} pts
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
}
