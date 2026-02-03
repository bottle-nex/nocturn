'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState, useRef } from 'react';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { templates } from '@/lib/templates';
import moment from 'moment';
import QuizzesUpperSection from './QuizzesUpperSection';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import MyQuizzesGridView from './MyQuizzesGridView';
import MyQuizzesListView from './MyQuizzesListView';

export enum Layouts {
    GRID = 'GRID',
    LIST = 'LIST',
}

export default function MyQuizzesPanel() {
    const { session } = useUserSessionStore();
    const [_loading, setLoading] = useState<boolean>(false);
    const { setAllQuizs, quizs, deleteQuiz } = useAllQuizsStore();
    const { deleteQuiz: deleteRecentlyViewed } = useRecentlyViewedQuizStore();
    const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState<string>('');
    const searchListenerAttached = useRef<boolean>(false);
    const [activeLayoutTab, setActiveLayoutTab] = useState<Layouts>(Layouts.GRID);

    useEffect(() => {
        async function get_quiz_data() {
            try {
                setLoading(true);
                if (!session?.user.token) return;
                const quiz_response = await QuizActions.get_quizzes(session.user.token);
                setAllQuizs(quiz_response?.quizzes || []);
            } catch (error) {
                console.error('Error in getting quiz', error);
            } finally {
                setLoading(false);
            }
        }
        get_quiz_data();
    }, [session?.user.token, setAllQuizs]);

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
        if (!session?.user.token || selectedQuizIds.size === 0) return;
        const quizIds = Array.from(selectedQuizIds);

        try {
            await QuizActions.move_selected_quizzes_to_trash(session.user.token, quizIds);

            quizIds.forEach((id) => {
                deleteQuiz(id);
                deleteRecentlyViewed(id);
            });

            setSelectedQuizIds(new Set());
        } catch (error) {
            console.error('Client error in deleting selected quizzes: ', error);
        }
    }

    const isAllSelected = quizs.length > 0 && selectedQuizIds.size === quizs.length;

    function handleToggleSelectAll() {
        setSelectedQuizIds((prev) => {
            if (quizs.length === 0) return prev;
            if (prev.size === quizs.length) return new Set();
            return new Set(quizs.map((q) => q.id));
        });
    }

    const filteredQuizzes = quizs.filter((q) =>
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col">
            <div className="w-full flex justify-start flex-col">
                <div className="flex justify-between">
                    <div className="text-4xl  text-dark-base dark:text-light-base">
                        My Quizzes
                    </div>
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
                    <div>no quizzes found</div>
                ) : activeLayoutTab === Layouts.GRID ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => {
                            const currTemplate = templates.find((t) => t.id === quiz.theme);
                            if (!currTemplate) return null;

                            const formattedTime = moment(quiz.createdAt).format('MMM D, YYYY');
                            const isSelected = selectedQuizIds.has(quiz.id);

                            return (
                                <MyQuizzesGridView
                                    key={quiz.id}
                                    quiz={quiz}
                                    isSelected={isSelected}
                                    toggleQuizSelection={toggleQuizSelection}
                                    currTemplate={currTemplate}
                                    formattedTime={formattedTime}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredQuizzes.map((quiz) => {
                            const currTemplate = templates.find((t) => t.id === quiz.theme);
                            if (!currTemplate) return null;

                            const formattedTime = moment(quiz.createdAt).format('MMM D, YYYY');
                            const isSelected = selectedQuizIds.has(quiz.id);

                            return (
                                <MyQuizzesListView
                                    key={quiz.id}
                                    quiz={quiz}
                                    isSelected={isSelected}
                                    toggleQuizSelection={toggleQuizSelection}
                                    currTemplate={currTemplate}
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
