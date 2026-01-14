'use client';
import axios from 'axios';
import InvertedQuizCards from '@/components/utility/InvertedQuizCards';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import { GET_ALL_OWNER_QUIZ_URL } from 'routes/api_routes';
import { Input } from '@/components/ui/input';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { FiPlus } from 'react-icons/fi';
import { v4 as uuid } from 'uuid';
import { useRouter } from 'next/navigation';
import { CustomResponse, UserQuizResponse } from '@nocturn/types';
import RecentlyViewedCard from '@/components/utility/RecentlyViewedCard';
import CanvasSkeleton from '@/components/skeletons/CanvasSkeleton';
import HomeStartWithAi from '@/components/home/HomeStartWithAi';
import HomeRightUpperSection from '@/components/home/HomeRightUpperSection';

export default function Page() {
    const router = useRouter();
    const [recentlyViewed, setRecentlyViewed] = useState<UserQuizResponse['recentlyViewed']>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    const { setAllQuizs } = useAllQuizsStore();

    useEffect(() => {
        async function getUserAllQuizs() {
            setLoading(true);
            if (!session?.user.token) return;
            try {
                const { data } = await axios.get<CustomResponse<UserQuizResponse>>(
                    GET_ALL_OWNER_QUIZ_URL,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user.token}`,
                        },
                    },
                );
                if (data.success) {
                    setAllQuizs(data.data?.quizzes || []);
                    setRecentlyViewed(data.data?.recentlyViewed || []);
                }
            } catch (err) {
                console.error('Error in getting all the quizzes', err);
            } finally {
                setLoading(false);
            }
        }

        getUserAllQuizs();
    }, [session?.user.token, setAllQuizs]);

    function handleCreateNewQuiz() {
        const newQuizId = uuid();
        router.push(`/new/${newQuizId}`);
    }
    return (
        <div className="bg-white dark:bg-zinc-900 w-full h-full rounded-sm px-12 py-10">
            <HomeRightUpperSection />
            <HomeStartWithAi />
            <section className="w-[24rem] flex flex-col relative h-fit -ml-8 mt-6">
                <InvertedQuizCards />
            </section>
            {loading && (
                <section className="flex items-center gap-4 flex-wrap mt-8">
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <CanvasSkeleton key={idx} className="w-88" />
                    ))}
                </section>
            )}
            {recentlyViewed.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-normal text-black dark:text-white mb-4">
                        Recently Viewed
                    </h2>
                    <div className="flex items-center gap-4 flex-wrap">
                        {recentlyViewed.map((quiz) => (
                            <RecentlyViewedCard key={quiz.id} quiz={quiz} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
