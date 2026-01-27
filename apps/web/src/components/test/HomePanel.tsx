'use client';
import InvertedQuizCards from '@/components/utility/InvertedQuizCards';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import RecentlyViewedCard from '@/components/utility/RecentlyViewedCard';
import CanvasSkeleton from '@/components/skeletons/CanvasSkeleton';
import HomeStartWithAi from '@/components/home/HomeStartWithAi';
import HomeRightUpperSection from '@/components/home/HomeRightUpperSection';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';

export default function HomePanel() {
    const [loading, setLoading] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    const { setAllQuizs } = useAllQuizsStore();
    const { recentlyViewed, setQuizs, setRecentlyViewed } = useRecentlyViewedQuizStore();

    useEffect(() => {
        async function get_quiz_data() {
            try {
                setLoading(true);
                if (!session?.user.token) return;

                const quiz_response = await QuizActions.get_quizzes(session.user.token);

                setQuizs(quiz_response?.quizzes || []);
                setAllQuizs(quiz_response?.quizzes || []);
                setRecentlyViewed(quiz_response?.recentlyViewed || []);
            } catch (error) {
                console.error('Error in getting quiz', error);
            } finally {
                setLoading(false);
            }
        }

        get_quiz_data();
    }, [session?.user.token, setQuizs, setRecentlyViewed, setAllQuizs]);

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 py-10 overflow-y-auto custom-scrollbar" data-lenis-prevent>
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
