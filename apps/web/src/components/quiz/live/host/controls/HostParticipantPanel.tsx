'use client';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { ParticipantType } from '@nocturn/types';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { QUIZ_URL } from 'routes/api_routes';

interface HostResponseProps {
    participants: ParticipantType[];
    hasMore: boolean;
    success: boolean;
}

export default function HostParticipantsPanel() {
    const { quiz } = useLiveQuizStore();
    const { session } = useUserSessionStore();
    const { participants, setParticipants, upsertParticipant } = useLiveParticipantsStore();

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataFetched, setDataFetched] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const hasFetchedOnce = useRef<boolean>(false);

    const quizId = quiz?.id;

    const fetchParticipants = useCallback(
        async (pageNum: number) => {
            if (!quizId || loading || !hasMore || !session?.user.token) return;

            setLoading(true);
            try {
                const response = await axios.get<HostResponseProps>(
                    `${QUIZ_URL}/${quizId}/participants?page=${pageNum}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.user.token}`,
                        },
                    },
                );

                const data = response.data;

                if (data.success) {
                    if (pageNum === 0) {
                        setParticipants(data.participants);
                    } else {
                        data.participants.forEach(upsertParticipant);
                    }
                    setHasMore(data.hasMore);
                    setPage(pageNum + 1);

                    if (!data.hasMore) {
                        setDataFetched(true);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch participants:', err);
            } finally {
                setLoading(false);
            }
        },
        [
            quizId,
            loading,
            hasMore,
            session?.user.token,
            setParticipants,
            upsertParticipant,
            setPage,
            setHasMore,
        ],
    );

    useEffect(() => {
        if (!quizId || loading || dataFetched || hasFetchedOnce.current) return;
        hasFetchedOnce.current = true;
        fetchParticipants(0);
    }, [quizId, fetchParticipants, loading, dataFetched]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetchParticipants(page);
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div
                className="w-full h-full p-4 overflow-y-auto custom-scrollbar"
                ref={containerRef}
                onScroll={handleScroll}
            >
                <div className="grid grid-cols-3 gap-6 px-4 py-3">
                    {participants.map((participant) => (
                        <div
                            key={participant.id}
                            className="flex flex-col items-center text-center hover:-translate-y-0.5 transition-all transform duration-200 ease-in-out"
                        >
                            <Image
                                src={participant.avatar || '/default-avatar.png'}
                                alt="userImage"
                                width={56}
                                height={56}
                                className="rounded-full border w-14 h-14 object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/default-avatar.png';
                                }}
                            />
                            <span className="mt-2 text-[13px] text-dark-alpha dark:text-neutral-300 break-words max-w-[5rem]">
                                {participant.nickname?.split(' ')[0]}
                            </span>
                        </div>
                    ))}
                </div>

                {loading && (
                    <div className="text-sm text-neutral-600 text-center mt-4">Loading...</div>
                )}

                {!loading && participants.length === 0 && (
                    <div className="text-xs text-neutral-600 text-center mt-4">
                        No participants have joined yet
                    </div>
                )}

                {!loading && participants.length > 0 && !hasMore && (
                    <div className="text-xs text-neutral-600 text-center mt-4">
                        No more participants
                    </div>
                )}
            </div>
        </div>
    );
}
