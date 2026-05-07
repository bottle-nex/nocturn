'use client';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { useEffect, useRef, useState } from 'react';
import { GET_LIVE_PRIZE_POOL_URL } from 'routes/api_routes';
import useLiveTemplate from '@/hooks/useLiveTemplate';

export default function StakeAmountPill() {
    const { quiz, updateQuiz } = useLiveQuizStore();
    const template = useLiveTemplate();
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function fetchPrizepool() {
            try {
                const { data } = await axios.get(`${GET_LIVE_PRIZE_POOL_URL}/${quiz?.id}`, {
                    withCredentials: true,
                });
                updateQuiz({
                    prizeDistributions: data.data,
                });
            } catch (err) {
                console.error('Error fetching prize pool:', err);
            }
        }
        if (quiz?.prizePool && !quiz.prizeDistributions) {
            fetchPrizepool();
        }
    }, [quiz?.prizePool, quiz.prizeDistributions, updateQuiz, quiz?.id]);

    useHandleClickOutside([containerRef], setExpanded);

    const distributions = quiz?.prizeDistributions ?? [];

    function rankLabel(rank: number) {
        if (rank === 1) return '1st';
        if (rank === 2) return '2nd';
        if (rank === 3) return '3rd';
        return `${rank}th`;
    }

    function rankColor(rank: number) {
        if (rank === 1) return '#2100c7';
        if (rank === 2) return '#ff4d6d';
        if (rank === 3) return '#1b035e';
        return `${template.itemsTextColor}80`;
    }

    if (quiz.prizePool <= 0) {
        return null;
    }

    return (
        <div className="absolute right-3.5 top-1.5 z-50" ref={containerRef}>
            <motion.div
                onClick={() => setExpanded((v) => !v)}
                animate={{
                    width: expanded ? 240 : 155,
                    borderRadius: 20,
                }}
                style={{
                    backgroundColor: template.itemsColor,
                    color: template.itemsTextColor,
                }}
                transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
                className="cursor-pointer shadow-2xl shadow-black/20 overflow-hidden origin-top-right"
            >
                {' '}
                {/* Header — always visible */}{' '}
                <div className="flex items-center gap-3 py-1.5 pl-1.5 pr-4 shadow-2xl shadow-black/20">
                    {' '}
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800/50">
                        {' '}
                        <Image
                            src={'/icons/usdc.png'}
                            alt="USDC"
                            className="object-contain p-1"
                            fill
                            unoptimized
                        />
                    </div>
                    <div className="flex flex-col items-start justify-center whitespace-nowrap">
                        <span className="mb-0.5 text-[9px] font-bold uppercase tracking-widest leading-none">
                            Prize Pool
                        </span>
                        <motion.span
                            animate={{ fontSize: expanded ? 18 : 14 }}
                            transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
                            className="font-bold tracking-tight  leading-none"
                        >
                            ${quiz?.prizePool ?? '10.00'}
                        </motion.span>
                    </div>
                </div>
                {/* Expanded distribution content */}
                <AnimatePresence initial={false}>
                    {expanded && distributions.length > 0 && (
                        <motion.div
                            key="distribution"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                type: 'spring' as const,
                                damping: 25,
                                stiffness: 300,
                                opacity: { duration: 0.2 },
                            }}
                            className="overflow-hidden"
                        >
                            <div
                                className="border-t mx-3"
                                style={{ borderColor: `${template.itemsTextColor}20` }}
                            />
                            <div
                                data-lenis-prevent
                                className="px-4 pt-3 pb-4 space-y-3 max-h-52 overflow-y-auto custom-scrollbar"
                            >
                                <span
                                    className="text-[11px] font-bold uppercase tracking-widest"
                                    style={{ color: `${template.itemsTextColor}80` }}
                                >
                                    Distribution
                                </span>
                                {distributions
                                    .sort((a, b) => a.rank - b.rank)
                                    .map((d) => (
                                        <div
                                            key={d.id}
                                            className="flex items-center justify-between"
                                        >
                                            <span
                                                className="text-base font-semibold"
                                                style={{ color: rankColor(d.rank) }}
                                            >
                                                {rankLabel(d.rank)}
                                            </span>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-sm">{d.percentage}%</span>
                                                {d.amount != null && (
                                                    <span
                                                        style={{
                                                            color: `${template.itemsTextColor}99`,
                                                        }}
                                                        className="text-base font-medium"
                                                    >
                                                        ${d.amount.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
