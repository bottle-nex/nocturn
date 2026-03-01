'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import QuizActions from '@/lib/backend/home/quiz-actions';
import moment from 'moment';
import QuizzesUpperSection from './QuizzesUpperSection';
import MyQuizzesGridView from './MyQuizzesGridView';
import MyQuizzesListView from './MyQuizzesListView';
import CanvasSkeletonCard from '../skeletons/CanvasSkeleton';
import NoContent from '../ui/NoContent';

export enum Layouts {
    GRID = 'GRID',
    LIST = 'LIST',
}

export default function FavouriteQuizzesPanel() {
    const { session } = useUserSessionStore();
    const { quizs, setAllQuizs, deleteQuiz } = useAllQuizsStore();
    const { deleteQuiz: deleteRecentlyViewed } = useRecentlyViewedQuizStore();
    const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
    const selectionMode = selectedQuizIds.size > 0;
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeLayoutTab, setActiveLayoutTab] = useState<Layouts>(Layouts.GRID);
    const searchListenerAttached = useRef<boolean>(false);
    const hasFetched = useRef<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function fetchQuizzes() {
            const token = session?.user?.token;
            if (!token || quizs.length > 0 || hasFetched.current) return;

            try {
                setLoading(true);
                hasFetched.current = true;

                const response = await QuizActions.get_quizzes(token);
                setAllQuizs(response || []);
            } catch (err) {
                console.error('Error fetching quizzes:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.token]);

    const favouriteQuizzes = useMemo(() => quizs.filter((q) => q.isFavourite), [quizs]);

    const filteredQuizzes = useMemo(
        () =>
            favouriteQuizzes.filter((q) =>
                q.title?.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        [favouriteQuizzes, searchQuery],
    );

    useEffect(() => {
        if (searchListenerAttached.current) return;

        const input = document.querySelector(
            'input[placeholder="search quizzes"]',
        ) as HTMLInputElement | null;

        if (!input) return;

        const handler = (e: Event) => {
            setSearchQuery((e.target as HTMLInputElement).value);
        };

        input.addEventListener('input', handler);
        searchListenerAttached.current = true;

        return () => {
            input.removeEventListener('input', handler);
            searchListenerAttached.current = false;
        };
    }, []);

    function toggleQuizSelection(quizId: string) {
        setSelectedQuizIds((prev) => {
            const next = new Set(prev);
            if (next.has(quizId)) {
                next.delete(quizId);
            } else if (!next.has(quizId)) {
                next.add(quizId);
            }
            // next.has(quizId) ? next.delete(quizId) : next.add(quizId);
            return next;
        });
    }

    function handleCancelSelection() {
        setSelectedQuizIds(new Set());
    }

    async function handleDeleteSelectedQuizzes() {
        if (!session?.user?.token || selectedQuizIds.size === 0) return;

        const quizIds = Array.from(selectedQuizIds);

        try {
            await QuizActions.move_selected_quizzes_to_trash(session.user.token, quizIds);

            quizIds.forEach((id) => {
                deleteQuiz(id);
                deleteRecentlyViewed(id);
            });

            setSelectedQuizIds(new Set());
        } catch (error) {
            console.error('Client error deleting favourite quizzes:', error);
        }
    }

    const isAllSelected =
        favouriteQuizzes.length > 0 && selectedQuizIds.size === favouriteQuizzes.length;

    function handleToggleSelectAll() {
        setSelectedQuizIds((prev) => {
            if (favouriteQuizzes.length === 0) return prev;
            if (prev.size === favouriteQuizzes.length) return new Set();
            return new Set(favouriteQuizzes.map((q) => q.id));
        });
    }

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col">
            <div className="w-full flex justify-start flex-col">
                <div className="flex justify-between">
                    <div className="text-4xl dark:text-light-base text-dark-base">Favourites</div>
                </div>

                <QuizzesUpperSection
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    quizzes={quizs}
                    selectedQuizes={selectedQuizIds.size}
                    onDeleteSelected={handleDeleteSelectedQuizzes}
                    onCancelSelection={handleCancelSelection}
                    onToggleSelectAll={handleToggleSelectAll}
                    isAllSelected={isAllSelected}
                    activeLayoutTab={activeLayoutTab}
                    onLayoutChange={setActiveLayoutTab}
                />
            </div>

            <div className="w-full h-full mt-6 overflow-y-auto overflow-x-hidden text-light-base">
                {loading ? (
                    <div className="grid grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <CanvasSkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredQuizzes.length === 0 ? (
                    <div className='h-full flex items-center justify-center'>
                        <NoContent
                            title="No favourites yet"
                            description="Mark quizzes as favourite to see them here."
                            className='-mt-52'
                        />
                    </div>
                ) : activeLayoutTab === Layouts.GRID ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <MyQuizzesGridView
                                key={quiz.id}
                                quiz={quiz}
                                isSelected={selectedQuizIds.has(quiz.id)}
                                selectionMode={selectionMode}
                                toggleQuizSelection={toggleQuizSelection}
                                formattedTime={moment(quiz.createdAt).format('MMM D, YYYY')}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredQuizzes.map((quiz) => (
                            <MyQuizzesListView
                                key={quiz.id}
                                quiz={quiz}
                                isSelected={selectedQuizIds.has(quiz.id)}
                                selectionMode={selectionMode}
                                toggleQuizSelection={toggleQuizSelection}
                                formattedTime={moment(quiz.createdAt).format('MMM D, YYYY')}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
