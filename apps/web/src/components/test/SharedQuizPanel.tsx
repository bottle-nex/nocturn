'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useEffect, useState } from 'react';
import QuizActions from '@/lib/backend/home/quiz-actions';
import moment from 'moment';
import MyQuizzesGridView from './MyQuizzesGridView';
import MyQuizzesListView from './MyQuizzesListView';
import { QuizType } from '@nocturn/types';
import CanvasSkeletonCard from '../skeletons/CanvasSkeleton';
import QuizzesUpperSection from './QuizzesUpperSection';

export enum Layouts {
    GRID = 'GRID',
    LIST = 'LIST',
}

export default function SharedQuizPanel() {
    const [loading, setLoading] = useState<boolean>(false);
    const [sharedQuizs, setSharedQuizs] = useState<QuizType[]>([]);
    const { session } = useUserSessionStore();
    const [selectedQuizIds, setSelectedQuizIds] = useState<Set<string>>(new Set());
    const selectionMode = selectedQuizIds.size > 0;
    const [activeLayoutTab, setActiveLayoutTab] = useState<Layouts>(Layouts.GRID);
    const [searchQuery, _setSearchQuery] = useState('');

    useEffect(() => {
        async function get_shared_quiz_data() {
            try {
                setLoading(true);
                if (!session?.user.token) return;
                const res = await QuizActions.get_shared_quizzes(session.user.token);
                setSharedQuizs(res || []);
            } catch (error) {
                console.error('Error in getting shared quizzes', error);
            } finally {
                setLoading(false);
            }
        }
        get_shared_quiz_data();
    }, [session?.user.token]);

    function toggleQuizSelection(id: string) {
        setSelectedQuizIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function handleToggleSelectAll() {
        if (selectedQuizIds.size === sharedQuizs.length) {
            setSelectedQuizIds(new Set());
        } else {
            setSelectedQuizIds(new Set(sharedQuizs.map((q) => q.id)));
        }
    }

    function handleCancelSelection() {
        setSelectedQuizIds(new Set());
    }

    async function handleDeleteSelected() {
        if (!session?.user.token || selectedQuizIds.size === 0) return;

        try {
            await QuizActions.move_selected_quizzes_to_trash(
                session.user.token,
                Array.from(selectedQuizIds),
            );

            setSharedQuizs((prev) => prev.filter((q) => !selectedQuizIds.has(q.id)));

            setSelectedQuizIds(new Set());
        } catch (err) {
            console.error('Failed deleting shared quizzes', err);
        }
    }

    const filteredQuizzes = sharedQuizs.filter((q) =>
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <main className="bg-white dark:bg-neutral-950 w-full h-full px-12 pt-18 flex flex-col">
            <div className="text-4xl text-dark-base dark:text-light-base">Shared Quizzes</div>

            <QuizzesUpperSection
                quizzes={sharedQuizs}
                selectedQuizes={selectedQuizIds.size}
                onDeleteSelected={handleDeleteSelected}
                onCancelSelection={handleCancelSelection}
                onToggleSelectAll={handleToggleSelectAll}
                isAllSelected={
                    selectedQuizIds.size === sharedQuizs.length && sharedQuizs.length > 0
                }
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
                ) : filteredQuizzes.length === 0 ? (
                    <div className="w-full h-[55vh] flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-lg">
                        No shared quizzes found
                    </div>
                ) : activeLayoutTab === Layouts.GRID ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <MyQuizzesGridView
                                key={quiz.id}
                                quiz={quiz}
                                isSelected={selectedQuizIds.has(quiz.id)}
                                selectionMode={selectionMode}
                                toggleQuizSelection={() => toggleQuizSelection(quiz.id)}
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
                                toggleQuizSelection={() => toggleQuizSelection(quiz.id)}
                                formattedTime={moment(quiz.createdAt).format('MMM D, YYYY')}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
