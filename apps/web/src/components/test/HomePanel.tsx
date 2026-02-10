'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import RecentlyViewedCard from '@/components/utility/RecentlyViewedCard';
import CanvasSkeleton from '@/components/skeletons/CanvasSkeleton';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import GetToKnowUs from '../base/GetToKnowUs';
import HomeFeatures from '../base/HomeFeatures';

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

                const [quiz_response, recently_viewed_response] = await Promise.all([
                    QuizActions.get_quizzes(session.user.token),
                    QuizActions.get_recently_viewed_quizzes(session.user.token),
                ]);

                setQuizs(quiz_response || []);
                setAllQuizs(quiz_response || []);
                setRecentlyViewed(recently_viewed_response || []);
            } catch (error) {
                console.error('Error in getting quiz', error);
            } finally {
                setLoading(false);
            }
        }

        get_quiz_data();
    }, [session?.user.token, setQuizs, setRecentlyViewed, setAllQuizs]);

    return (
        <div
            className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 overflow-y-auto max-h-screen"
            data-lenis-prevent
        >
            <section className='flex flex-col gap-y-8'>
                <div className="flex justify-between">
                    <div className="text-4xl dark:text-light-base text-dark-base">Home</div>
                </div>
                {/* <HomeRightUpperSection /> */}
                {/* <HomeStartWithAi /> */}

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
                        <div className="gap-6 lg:grid-cols-3 grid">
                            {recentlyViewed.map((quiz) => (
                                <RecentlyViewedCard className="w-full" key={quiz.id} quiz={quiz} />
                            ))}
                        </div>
                    </section>
                )}
                <HomeFeatures />
                <GetToKnowUs />
            </section>
        </div>
    );
}
