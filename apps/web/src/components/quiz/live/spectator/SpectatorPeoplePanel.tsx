'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveSpectatorsStore } from '@/store/live-quiz/useLiveSpectatorsStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { SpectatorType } from '@nocturn/types';
import { QUIZ_URL } from 'routes/api_routes';

interface SpectatorApiResponse {
    spectators: SpectatorType[];
    hasMore: boolean;
    success: boolean;
}

const SpectatorPeoplePanel = forwardRef<HTMLDivElement>((_, ref) => {
    const { quiz } = useLiveQuizStore();
    const { session } = useUserSessionStore();
    const { spectators, setSpectators, upsertSpectator } = useLiveSpectatorsStore();

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const prevSpectatorsRef = useRef<SpectatorType[]>([]);

    const quizId = quiz?.id;

    const fetchSpectators = useCallback(
        async (pageNum: number) => {
            if (!quizId || loading || !hasMore || !session?.user.token) return;

            if (pageNum > 0) setLoading(true);

            try {
                const response = await axios.get<SpectatorApiResponse>(
                    `${QUIZ_URL}/${quizId}/spectators?page=${pageNum}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session.user.token}`,
                        },
                    },
                );

                if (response.data.success) {
                    const isDifferent =
                        JSON.stringify(response.data.spectators) !==
                        JSON.stringify(prevSpectatorsRef.current);

                    if (isDifferent) {
                        if (pageNum === 0) {
                            setSpectators(response.data.spectators);
                        } else {
                            response.data.spectators.forEach(upsertSpectator);
                        }
                        prevSpectatorsRef.current = response.data.spectators;
                    }

                    setHasMore(response.data.hasMore);
                    setPage(pageNum + 1);
                }
            } catch (err) {
                console.error('Failed to fetch spectators:', err);
            } finally {
                if (pageNum > 0) setLoading(false);
            }
        },
        [quizId, loading, hasMore, session?.user.token, setSpectators, upsertSpectator],
    );

    useEffect(() => {
        if (quizId) {
            fetchSpectators(0);
        }
    }, [quizId, fetchSpectators]);

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container || loading || !hasMore) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            fetchSpectators(page);
        }
    };

    return (
        <div ref={ref} className="w-full h-full flex flex-col">
            <div
                className="w-full h-full p-4 overflow-y-auto custom-scrollbar pt-6"
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
                            <span className="mt-2 text-[13px] text-dark-prime dark:text-neutral-300 break-words max-w-[5rem]">
                                {spectator.nickname?.split(' ')[0]}
                            </span>
                        </div>
                    ))}
                </div>

                {!loading && spectators.length === 0 && !hasMore && (
                    <div className="text-xs text-neutral-600 text-center mt-4">
                        No spectators have joined yet
                    </div>
                )}

                {!loading && spectators.length > 0 && !hasMore && (
                    <div className="text-xs text-neutral-600 text-center mt-4">
                        No more spectators
                    </div>
                )}

                {loading && hasMore && (
                    <div className="text-sm text-neutral-600 text-center mt-4">Loading...</div>
                )}
            </div>
        </div>
    );
});

SpectatorPeoplePanel.displayName = 'SpectatorPeoplePanel';

export default SpectatorPeoplePanel;
