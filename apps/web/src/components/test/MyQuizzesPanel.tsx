'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState, useRef } from 'react';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
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
    const { quizs, setAllQuizs, deleteQuiz } = useAllQuizsStore();
    const { deleteQuiz: deleteRecentlyViewed } = useRecentlyViewedQuizStore();

    const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
    const selectionMode = selectedQuizIds.size > 0;

    const [searchQuery, setSearchQuery] = useState<string>('');
    const searchListenerAttached = useRef<boolean>(false);
    const [activeLayoutTab, setActiveLayoutTab] = useState<Layouts>(Layouts.GRID);

    function handleCancelSelection() {
        setSelectedQuizIds(new Set());
    }

    useEffect(() => {
        async function get_quiz_data() {
            try {
                setLoading(true);
                if (!session?.user.token) return;
                const quiz_response = await QuizActions.get_quizzes(session.user.token);
                setAllQuizs(quiz_response || []);
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

        const handler = (e: Event) => setSearchQuery((e.target as HTMLInputElement).value);

        input.addEventListener('input', handler);
        searchListenerAttached.current = true;

        return () => input.removeEventListener('input', handler);
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
        const ids = Array.from(selectedQuizIds);

        await QuizActions.move_selected_quizzes_to_trash(session.user.token, ids);

        ids.forEach((id) => {
            deleteQuiz(id);
            deleteRecentlyViewed(id);
        });

        setSelectedQuizIds(new Set());
    }

    const isAllSelected = quizs.length > 0 && selectedQuizIds.size === quizs.length;

    function handleToggleSelectAll() {
        setSelectedQuizIds((prev) =>
            prev.size === quizs.length ? new Set() : new Set(quizs.map((q) => q.id)),
        );
    }

    const filteredQuizzes = quizs.filter((q) =>
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col">
            <QuizzesUpperSection
                selectedQuizes={selectedQuizIds.size}
                onDeleteSelected={handleDeleteSelectedQuizzes}
                onCancelSelection={handleCancelSelection}
                onToggleSelectAll={handleToggleSelectAll}
                isAllSelected={isAllSelected}
                activeLayoutTab={activeLayoutTab}
                onLayoutChange={setActiveLayoutTab}
            />

            <div className="w-full mt-6 overflow-y-auto overflow-x-hidden">
                {activeLayoutTab === Layouts.GRID ? (
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
