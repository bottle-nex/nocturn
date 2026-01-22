'use client';
import InvertedQuizCards from '@/components/utility/InvertedQuizCards';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import RecentlyViewedCard from '@/components/utility/RecentlyViewedCard';
import CanvasSkeleton from '@/components/skeletons/CanvasSkeleton';
import HomeStartWithAi from '@/components/home/HomeStartWithAi';
import HomeRightUpperSection from '@/components/home/HomeRightUpperSection';
import { useAllTrashedQuizzesStore } from '@/store/user/useAllTrashedQuizzesStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { UserQuizResponse } from '@nocturn/types';

export default function HomePanel() {
    const [recentlyViewed, setRecentlyViewed] = useState<UserQuizResponse['recentlyViewed']>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    const { setAllQuizs } = useAllQuizsStore();
    const { setAllTrashedQuizzes } = useAllTrashedQuizzesStore();

    useEffect(() => {
        async function get_quiz_data() {
            try {
                setLoading(true);
                if (!session?.user.token) return;

                //  fetching all quizzes
                const quiz_response = await QuizActions.get_quizzes(session.user.token);
                setAllQuizs(quiz_response?.quizzes || []);
                setRecentlyViewed(quiz_response?.recentlyViewed || []);
            } catch (error) {
                console.error('Error in getting quiz', error);
            } finally {
                setLoading(false);
            }
        }
        get_quiz_data();
    }, [session?.user.token, setAllQuizs, setAllTrashedQuizzes]);

    return (
        <div className="bg-white dark:bg-zinc-900 w-full h-full px-12 py-10">
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
