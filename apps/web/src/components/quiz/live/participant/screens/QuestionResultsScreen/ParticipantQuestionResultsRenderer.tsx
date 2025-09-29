'use client';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useEffect, useRef, useState, useMemo } from 'react';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { Button } from '@/components/ui/button';
import { GoShareAndroid } from 'react-icons/go';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { DotPattern } from '@/components/magicui/dot-pattern';
import LeaderboardResultCard from './LeaderboardResultCard';
import LeaderboardParticipantBar from './LeaderboardParticipantBars';
import { ParticipantType } from '@/types/prisma-types';

export default function ParticipantQuestionResultsRenderer() {
    const { participants, responses, getResponse } = useLiveParticipantsStore();
    const { participantData } = useLiveParticipantStore();
    const { currentQuestion, setAlreadyResponded } = useLiveQuizStore();

    const sortedParticipants = useMemo(() => {
        return [...participants].sort((p1, p2) => p2.totalScore - p1.totalScore);
    }, [participants]);

    const colorMapRef = useRef<Map<string, string>>(new Map());

    // Memoize participant colors calculation
    const participantColors = useMemo(() => {
        return sortedParticipants.map((participant, index) => {
            const { id } = participant;

            if (!colorMapRef.current.has(id)) {
                const rank = index + 1;
                colorMapRef.current.set(id, getRandomColor(rank));
            }

            return colorMapRef.current.get(id)!;
        });
    }, [sortedParticipants]);

    const visibleBars = useMemo(() => {
        return sortedParticipants.slice(0, 6);
    }, [sortedParticipants]);

    const [currentUser, setCurrentUser] = useState<ParticipantType | null>(null);
    const [yourRank, setYourRank] = useState<number>(1);
    const [yourStreak, setYourStreak] = useState<number>(0);
    const [yourAnswer, setYourAnswer] = useState<number | undefined>();

    useEffect(() => {
        setAlreadyResponded(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!participantData) return;

        const user = sortedParticipants.find((p) => p.id === participantData.id);
        setCurrentUser(user ?? participantData);

        if (!user) return;

        const index = sortedParticipants.findIndex((p) => p.id === user.id);
        setYourRank(index >= 0 ? index + 1 : 1);

        setYourStreak(user?.longestStreak ?? 0);

        const response = getResponse(user.id);
        setYourAnswer(response?.selectedAnswer);
    }, [participantData, sortedParticipants, responses, getResponse]); // Removed getResponse from dependencies

    if (!currentQuestion) {
        return (
            <div className="text-center text-neutral-400 w-full">Error in fetching question</div>
        );
    }

    return (
        <div className="w-full h-full bg-black/20 overflow-hidden flex justify-center items-center relative z-0 p-2 sm:p-4">
            <div className="w-full max-w-7xl h-[95vh] sm:h-[90vh] md:h-[85vh] lg:h-[80%] flex flex-col justify-between rounded-xl sm:rounded-2xl bg-neutral-950 border relative shadow-lg overflow-hidden">
                <div className="absolute inset-0 pointer-events-none z-0 fade-dots opacity-35">
                    <DotPattern />
                </div>

                <div className="flex justify-center items-center px-4 sm:px-6 lg:px-7 py-4 sm:py-6 lg:py-7">
                    <h2 className="text-white text-lg sm:text-xl md:text-2xl font-extralight select-none tracking-wider">
                        QUIZ RESULTS
                    </h2>
                </div>

                <div className="flex flex-col lg:flex-row flex-grow px-3 sm:px-4 lg:px-6 gap-4 lg:gap-x-6 items-center lg:items-center justify-center h-full">
                    <div className="w-full lg:w-auto lg:max-w-md mx-auto p-3 sm:p-4 lg:p-6 flex items-center justify-center order-2 lg:order-1 h-full">
                        <LeaderboardResultCard
                            participant={currentUser}
                            currentQuestion={currentQuestion}
                            userAnswer={yourAnswer}
                            rank={yourRank > 0 ? yourRank : 1}
                            streak={yourStreak}
                        />
                    </div>

                    <div className="flex flex-row-reverse items-end justify-center gap-x-2 sm:gap-x-4 lg:gap-x-6 flex-grow order-1 lg:order-2 h-full">
                        {visibleBars.map((p, index) => {
                            const rank = index + 1;
                            const baseHeight = getRelativeHeight(rank);
                            const color = participantColors[index];
                            const you = p.id === participantData?.id;

                            return (
                                <LeaderboardParticipantBar
                                    key={p.id} // Use participant ID as key instead of index
                                    baseHeight={baseHeight}
                                    color={color ?? '#ccc'}
                                    nickname={p.nickname}
                                    avatar={p.avatar ?? '/default-avatar.png'}
                                    score={p.totalScore}
                                    rank={rank}
                                    you={you}
                                />
                            );
                        })}
                    </div>
                </div>

                <div className="relative px-4 sm:px-5 py-3 sm:py-4">
                    <ToolTipComponent content="Share results">
                        <Button className="absolute bottom-3 sm:bottom-3.5 right-3 sm:right-4 text-black px-3 sm:px-4 py-1 rounded-md bg-light-base hover:bg-light-base/90 transition-all ease-in-out duration-100 text-sm">
                            <GoShareAndroid className="w-4 h-4" />
                        </Button>
                    </ToolTipComponent>
                </div>
            </div>
        </div>
    );
}

function getRelativeHeight(rank: number) {
    if (rank === 1) return 450;
    const calculatedHeight = 450 - (rank - 1) * 40;
    return calculatedHeight > 50 ? calculatedHeight : 50;
}

function getRandomColor(rank: number): string {
    const colors = [
        '#67C090',
        '#26667F',
        '#124170',
        '#468A9A',
        '#33A1E0',
        '#568F87',
        '#064232',
        '#E43636',
        '#F08B51',
        '#E1AA36',
    ];

    switch (rank) {
        case 1:
            return '#facc15';
        case 2:
            return '#C0C0C0';
        case 3:
            return '#CD7F32';
        default:
            return colors[Math.floor(Math.random() * colors.length)] || '#c9ee80';
    }
}
