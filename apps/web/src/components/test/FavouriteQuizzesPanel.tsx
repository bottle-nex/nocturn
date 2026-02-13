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

export enum Layouts {
    GRID = 'GRID',
    LIST = 'LIST',
}

export default function FavouriteQuizzesPanel() {
    const { session } = useUserSessionStore();
    const { quizs, setAllQuizs, deleteQuiz } = useAllQuizsStore();
    const { deleteQuiz: deleteRecentlyViewed } = useRecentlyViewedQuizStore();

    const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLayoutTab, setActiveLayoutTab] = useState<Layouts>(Layouts.GRID);

    const searchListenerAttached = useRef(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        async function fetchQuizzes() {
            try {
                const token = session?.user?.token;
                if (!token) return;
                if (quizs.length > 0) return;
                if (hasFetched.current) return;

                hasFetched.current = true;

                const response = await QuizActions.get_quizzes(token);
                setAllQuizs(response || []);
            } catch (err) {
                console.error('Error fetching quizzes:', err);
            }
        }

        fetchQuizzes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user?.token]);

    const favouriteQuizzes = useMemo(() => quizs.filter((q) => q.isFavourite), [quizs]);

    const filteredQuizzes = useMemo(() => {
        return favouriteQuizzes.filter((q) =>
            q.title?.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [favouriteQuizzes, searchQuery]);

    useEffect(() => {
        if (searchListenerAttached.current) return;

        const input = document.querySelector(
            'input[placeholder="search quizzes"]',
        ) as HTMLInputElement | null;

        if (!input) return;

        const handler = (e: Event) => {
            const value = (e.target as HTMLInputElement).value;
            setSearchQuery(value);
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
            } else {
                next.add(quizId);
            }
            return next;
        });
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

            if (prev.size === favouriteQuizzes.length) {
                return new Set();
            }

            return new Set(favouriteQuizzes.map((q) => q.id));
        });
    }

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col">
            <div className="w-full flex justify-start flex-col">
                <div className="flex justify-between">
                    <div className="text-4xl text-light-base">Favourites</div>
                </div>

                <QuizzesUpperSection
                    selectedQuizes={selectedQuizIds.size}
                    onDeleteSelected={handleDeleteSelectedQuizzes}
                    onToggleSelectAll={handleToggleSelectAll}
                    isAllSelected={isAllSelected}
                    activeLayoutTab={activeLayoutTab}
                    onLayoutChange={setActiveLayoutTab}
                />
            </div>

            <div className="w-full mt-6 overflow-y-auto overflow-x-hidden text-light-base">
                {filteredQuizzes.length === 0 ? (
                    <div>No favourite quizzes yet</div>
                ) : activeLayoutTab === Layouts.GRID ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => {
                            const formattedTime = moment(quiz.createdAt).format('MMM D, YYYY');

                            return (
                                <MyQuizzesGridView
                                    key={quiz.id}
                                    quiz={quiz}
                                    isSelected={selectedQuizIds.has(quiz.id)}
                                    toggleQuizSelection={toggleQuizSelection}
                                    formattedTime={formattedTime}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredQuizzes.map((quiz) => {
                            const formattedTime = moment(quiz.createdAt).format('MMM D, YYYY');

                            return (
                                <MyQuizzesListView
                                    key={quiz.id}
                                    quiz={quiz}
                                    isSelected={selectedQuizIds.has(quiz.id)}
                                    toggleQuizSelection={toggleQuizSelection}
                                    formattedTime={formattedTime}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
