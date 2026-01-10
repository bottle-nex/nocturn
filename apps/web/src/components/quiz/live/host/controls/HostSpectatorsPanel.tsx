'use client';

import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveSpectatorsStore } from '@/store/live-quiz/useLiveSpectatorsStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { SpectatorType } from '@nocturn/types';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { QUIZ_URL } from 'routes/api_routes';

interface HostResponseProps {
    spectators: SpectatorType[];
    hasMore: boolean;
    success: boolean;
}

export default function HostSpectatorsPanel() {
    const { quiz } = useLiveQuizStore();
    const { session } = useUserSessionStore();
    const { spectators, setSpectators, upsertSpectator } = useLiveSpectatorsStore();

    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [dataFetched, setDataFetched] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasFetchedOnce = useRef<boolean>(false);

    const quizId = quiz?.id;

    const fetchSpectators = useCallback(
        async (pageNum: number) => {
            if (!quizId || loading || !hasMore || !session?.user.token) return;
            setLoading(true);

            try {
                const response = await axios.get<HostResponseProps>(
                    `${QUIZ_URL}/${quizId}/spectators?page=${pageNum}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.user.token}`,
                        },
                    },
                );

                const data = response.data;

                if (data.success) {
                    if (pageNum === 0) {
                        setSpectators(data.spectators);
                    } else {
                        data.spectators.forEach(upsertSpectator);
                    }
                    setHasMore(data.hasMore);
                    setPage(pageNum + 1);

                    if (!data.hasMore) {
                        setDataFetched(true);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch spectators:', err);
            } finally {
                setLoading(false);
            }
        },
        [quizId, loading, hasMore, session?.user.token, setSpectators, upsertSpectator],
    );

    useEffect(() => {
        if (!quizId || loading || dataFetched || hasFetchedOnce.current) return;
        hasFetchedOnce.current = true;
        fetchSpectators(0);
    }, [quizId, fetchSpectators, loading, dataFetched]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetchSpectators(page);
        }
    };

    const initialLoadDone = spectators.length > 0 || !loading;

    return (
        <div className="w-full h-full flex flex-col">
            <div
                className="w-full h-full p-4 overflow-y-auto custom-scrollbar"
                ref={containerRef}
                onScroll={handleScroll}
            >
                <div className="grid grid-cols-3 gap-6 px-4 py-3">
                    {spectators.map((spectator) => (
                        <div
                            key={spectator.id}
                            className="flex flex-col items-center text-center hover:-translate-y-0.5 transition-all transform duration-200 ease-in-out"
                        >
                            <Image
                                src={spectator.avatar || '/default-avatar.png'}
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
                                {spectator.nickname?.split(' ')[0]}
                            </span>
                        </div>
                    ))}
                </div>

                {loading && initialLoadDone && (
                    <div className="text-sm text-neutral-600 text-center mt-4">Loading...</div>
                )}

                {!loading && spectators.length === 0 && (
                    <div className="text-xs text-neutral-600 text-center mt-4">
                        No spectators have joined yet
                    </div>
                )}

                {!loading && spectators.length > 0 && !hasMore && (
                    <div className="text-xs text-neutral-600 text-center mt-4">
                        No more spectators
                    </div>
                )}
            </div>
        </div>
    );
}
