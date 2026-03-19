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
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { HiSparkles, HiPlus } from 'react-icons/hi2';
import { cn } from '@/lib/utils';

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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const setAiExpanded = useAiChatStore((s) => s.setExpanded);

    useHandleClickOutside([dropdownRef], setDropdownOpen);

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
                    <div className="relative" ref={dropdownRef}>
                        <div className="flex">
                            <Button
                                id="tour-new-quiz"
                                onClick={handleCreateQuiz}
                                disabled={creating}
                                className="relative px-3! py-4.75 bg-nprimary dark:text-light-base font-medium rounded-l-lg rounded-r-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-shadow cursor-pointer flex items-center gap-3 border border-nprimary border-r-0 after:absolute after:right-0 after:top-px after:bottom-px after:w-px after:bg-[rgba(255,255,255,0.15)]"
                            >
                                <span>{creating ? 'Creating' : 'New Quiz'}</span>
                            </Button>
                            <Button
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                disabled={creating}
                                className="px-8 py-4.75 bg-nprimary dark:text-light-base font-medium rounded-r-lg rounded-l-none shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-shadow cursor-pointer flex items-center gap-3 border border-nprimary border-l-0"
                            >
                                <ChevronDown
                                    className={cn(
                                        'transition-transform duration-300',
                                        dropdownOpen ? 'rotate-180' : 'rotate-0',
                                    )}
                                />
                            </Button>
                        </div>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
                                    className="absolute right-0 top-full mt-2 w-52 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] overflow-hidden z-50 dark:bg-dark-alpha bg-light-alpha border dark:border-light-base/10 border-dark-base/10"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            setAiExpanded(true);
                                        }}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:dark:bg-light-base/5 hover:bg-dark-base/5 transition-colors cursor-pointer dark:text-light-base text-dark-base"
                                    >
                                        <HiSparkles className="text-lg" />
                                        <span className="text-sm font-medium">Start from AI</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            handleCreateQuiz();
                                        }}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:dark:bg-light-base/5 hover:bg-dark-base/5 transition-colors cursor-pointer dark:text-light-base text-dark-base"
                                    >
                                        <HiPlus className="text-lg" />
                                        <span className="text-sm font-medium">
                                            Start from scratch
                                        </span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
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
