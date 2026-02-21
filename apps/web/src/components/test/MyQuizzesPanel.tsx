'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import moment from 'moment';
import QuizzesUpperSection from './QuizzesUpperSection';
import MyQuizzesGridView from './MyQuizzesGridView';
import MyQuizzesListView from './MyQuizzesListView';
import CanvasSkeletonCard from '@/components/skeletons/CanvasSkeleton';

export enum Layouts {
    GRID = 'GRID',
    LIST = 'LIST',
}

export default function MyQuizzesPanel() {
    const { session } = useUserSessionStore();
    const [loading, setLoading] = useState(true);
    const { quizs, setAllQuizs, deleteQuiz } = useAllQuizsStore();
    const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
    const selectionMode = selectedQuizIds.size > 0;
    const [searchQuery, _setSearchQuery] = useState<string>('');
    const [activeLayoutTab, setActiveLayoutTab] = useState<Layouts>(Layouts.GRID);
    const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

    useEffect(() => {
        async function get_quiz_data() {
            if (!session?.user.token) {
                setLoading(false);
                return;
            }
            try {
                const quiz_response = await QuizActions.get_quizzes(session.user.token);
                setAllQuizs(quiz_response || []);
            } finally {
                setLoading(false);
            }
        }
        get_quiz_data();
    }, [session?.user.token, setAllQuizs]);

    const filteredQuizzes = quizs.filter((q) =>
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    function toggleQuizSelection(quizId: string) {
        if (bulkDeleting) return;

        setSelectedQuizIds((prev) => {
            const next = new Set(prev);
            if (next.has(quizId)) next.delete(quizId);
            else next.add(quizId);
            return next;
        });
    }

    function cancelSelection() {
        if (bulkDeleting) return;
        setSelectedQuizIds(new Set());
    }

    function toggleSelectAll() {
        if (bulkDeleting) return;

        setSelectedQuizIds((prev) => {
            if (prev.size === filteredQuizzes.length) return new Set();
            return new Set(filteredQuizzes.map((q) => q.id));
        });
    }

    async function deleteSelected() {
        if (!session?.user.token || selectedQuizIds.size === 0 || bulkDeleting) return;

        setBulkDeleting(true);

        try {
            const ids = Array.from(selectedQuizIds);

            for (const id of ids) {
                try {
                    await QuizActions.delete_quiz(session.user.token, id);
                    deleteQuiz(id);
                } catch {
                    console.error('Failed to delete selected quizzes');
                }
            }

            setSelectedQuizIds(new Set());
        } finally {
            setBulkDeleting(false);
        }
    }

    const isAllSelected =
        filteredQuizzes.length > 0 && selectedQuizIds.size === filteredQuizzes.length;

    return (
        <div className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col">
            <div className="text-4xl text-dark-base dark:text-light-base">My Quizzes</div>

            <QuizzesUpperSection
                quizzes={quizs}
                selectedQuizes={selectedQuizIds.size}
                onDeleteSelected={deleteSelected}
                onCancelSelection={cancelSelection}
                onToggleSelectAll={toggleSelectAll}
                isAllSelected={isAllSelected}
                activeLayoutTab={activeLayoutTab}
                onLayoutChange={setActiveLayoutTab}
            />

            <div
                className="w-full mt-6 overflow-y-auto overflow-x-hidden custom-scrollbar"
                data-lenis-prevent
            >
                {loading ? (
                    <div className="grid grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <CanvasSkeletonCard key={i} />
                        ))}
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
                                bulkDeleting={bulkDeleting}
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
                                bulkDeleting={bulkDeleting}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
