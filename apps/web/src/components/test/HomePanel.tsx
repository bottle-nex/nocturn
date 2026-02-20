'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useRef, useState } from 'react';
import RecentlyViewedCard from '@/components/utility/RecentlyViewedCard';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import GetToKnowUs from '../base/GetToKnowUs';
import HomeFeatures from '../base/HomeFeatures';

export default function HomePanel() {
    const token = useUserSessionStore((s) => s.session?.user?.token);
    const { setAllQuizs, quizs } = useAllQuizsStore();
    const { recentlyViewed, setQuizs, setRecentlyViewed } = useRecentlyViewedQuizStore();

    const [loading, setLoading] = useState(true);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        if (fetchedRef.current) return;
        if (quizs.length > 0) {
            setLoading(false);
            return;
        }

        fetchedRef.current = true;

        async function get_quiz_data() {
            try {
                const [quiz_response, recently_viewed_response] = await Promise.all([
                    QuizActions.get_quizzes(token),
                    QuizActions.get_recently_viewed_quizzes(token),
                ]);

                setQuizs(quiz_response ?? []);
                setAllQuizs(quiz_response ?? []);
                setRecentlyViewed(recently_viewed_response ?? []);
            } catch (error) {
                console.error('Error in getting quiz', error);
            } finally {
                setLoading(false);
            }
        }

        get_quiz_data();
    }, [token, quizs.length, setAllQuizs, setQuizs, setRecentlyViewed]);

    return (
        <div
            className="bg-light-alpha dark:bg-neutral-950 w-full h-full px-12 pt-18 pb-28 overflow-y-auto max-h-screen"
            data-lenis-prevent
        >
            <section className="flex flex-col gap-y-8">
                <div className="flex justify-between">
                    <div className="text-4xl dark:text-light-base text-dark-base">Home</div>
                </div>

                {(loading || recentlyViewed.length > 0) && (
                    <section className="mt-8">
                        {!loading && (
                            <h2 className="text-lg font-normal text-black dark:text-white mb-4">
                                Recently Viewed
                            </h2>
                        )}

                        <div className="gap-6 lg:grid-cols-3 grid">
                            {loading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                      <RecentlyViewedCard key={i} loading />
                                  ))
                                : recentlyViewed
                                      .slice(0, 3)
                                      .map((quiz) => (
                                          <RecentlyViewedCard key={quiz.id} quiz={quiz} />
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
