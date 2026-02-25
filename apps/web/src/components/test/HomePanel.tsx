'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useRef, useState } from 'react';
import RecentlyViewedCard from '@/components/utility/RecentlyViewedCard';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import GetToKnowUs from '../base/GetToKnowUs';
import HomeFeatures from '../base/HomeFeatures';
import { Button } from '../ui/button';
import BackendActions from '@/lib/backend/new/quiz-backend-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { FiPlus } from 'react-icons/fi';
import { Loader } from 'lucide-react';

export default function HomePanel() {
    const token = useUserSessionStore((s) => s.session?.user?.token);
    const { setAllQuizs, quizs } = useAllQuizsStore();
    const { recentlyViewed, setQuizs, setRecentlyViewed } = useRecentlyViewedQuizStore();
    const [loading, setLoading] = useState<boolean>(true);
    const fetchedRef = useRef<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    const { updateQuiz } = useNewQuizStore();
    const router = useRouter();

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

    async function handleCreateQuiz() {
        if (!session?.user.token || creating) return;
        setCreating(true);
        try {
            const quiz = await BackendActions.createQuiz(session.user.token);
            if (!quiz) {
                toast.error('Failed to create quiz');
                return;
            }
            updateQuiz(quiz);
            router.push(`/new/${quiz.id}`);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div
            className="bg-light-alpha dark:bg-neutral-950 w-full h-full px-12 pt-18 pb-28 overflow-y-auto max-h-screen"
            data-lenis-prevent
        >
            <section className="flex flex-col gap-y-8">
                <div className="flex justify-between items-center">
                    <div className="text-4xl dark:text-light-base text-dark-base">Home</div>
                    <Button
                        onClick={handleCreateQuiz}
                        disabled={creating}
                        className="px-8 py-4.75 bg-nprimary dark:text-light-base font-medium rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-shadow cursor-pointer flex items-center gap-3 border border-nprimary"
                    >
                        {creating ? <Loader className="animate-spin size-4" /> : <FiPlus />}
                        <span>{creating ? 'Creating' : 'New Quiz'}</span>
                    </Button>
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
