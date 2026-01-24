'use client';
import { AnimatePresence } from 'framer-motion';
import OpacityBackground from '../utility/OpacityBackground';
import UtilityCard from '../utility/UtilityCard';
import { Button } from '../ui/button';
import Lottie from 'lottie-react';
import { MdDelete } from 'react-icons/md';
import EmptyCanvas from '../canvas/EmptyCanvas';
import moment from 'moment';
import { templates } from '@/lib/templates';
import emptyTrashAnimation from '../../assets/lottie/empty-trash.json';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from 'sonner';
import { useAllTrashedQuizzesStore } from '@/store/user/useAllTrashedQuizzesStore';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { IoTrashBinOutline } from 'react-icons/io5';
import { IoMdRefresh } from 'react-icons/io';

export default function HomeTrashPanel() {
    const { trashedQuizzes, resetTrashQuizStore, setAllTrashedQuizzes, removeTrashedQuizById } =
        useAllTrashedQuizzesStore();
    const { addQuiz } = useAllQuizsStore();
    const { setActiveTab } = useHomeSidebarStore();
    const { session } = useUserSessionStore();

    async function handleDeleteAllTrashedQuizzes() {
        if (!session?.user.token) return;

        try {
            await QuizActions.delete_all_trashed_quizzes(session.user.token);
            resetTrashQuizStore();
            toast.success('Cleared trash successfully');
        } catch (error) {
            console.error('Failed to delete quizzes', error);
            toast.error('Failed to clear trash');
        }
    }

    useEffect(() => {
        async function get_quiz_data() {
            try {
                if (!session?.user.token) return;

                //   fetchig trashed quizzes
                const trashed_quiz_response = await QuizActions.get_trashed_quizzes(
                    session.user.token,
                );
                setAllTrashedQuizzes(trashed_quiz_response!);
            } catch (error) {
                console.error('Error in getting quiz', error);
            }
        }
        get_quiz_data();
    }, [session?.user.token, setAllTrashedQuizzes]);

    async function handleRestoreQuiz(quizId: string) {
        if (!session?.user.token) return;

        try {
            const restoredQuiz = await QuizActions.restore_trashed_quiz(session.user.token, quizId);

            if (!restoredQuiz) return;

            removeTrashedQuizById(restoredQuiz.id);
            addQuiz(restoredQuiz);

            toast.success('Quiz restored');
        } catch (error) {
            console.error('Restore failed', error);
        }
    }

    async function handlePermanentlyDeleteQuiz(quizId: string) {
        if (!session?.user.token) return;
        try {
            const deletedQuiz = await QuizActions.permanently_delete_quiz(
                session.user.token,
                quizId,
            );
            if (!deletedQuiz) return;

            removeTrashedQuizById(deletedQuiz.id);
            toast.success('Quiz permanently deleted');
        } catch (error) {
            console.error('Error in permanently deleting quiz: ', error);
            return;
        }
    }

    return (
        <AnimatePresence>
            <OpacityBackground
                className="bg-black/10 dark:bg-white/10"
                onBackgroundClick={() => setActiveTab(null)}
            >
                <UtilityCard className="max-w-[70vw] mx-auto w-full h-[80vh] rounded-md bg-white dark:bg-dark-alpha/70 border-none p-7 overflow-hidden">
                    <div className="flex flex-col w-full h-full gap-y-8 relative px-2">
                        <div className="flex w-full justify-between items-center">
                            <div className="flex flex-col justify-center -space-y-0.5">
                                <div className="text-xl dark:text-nlighter text-ndarkest tracking-wide">
                                    Trashed Quizzes
                                </div>
                                <div className="text-sm text-light-base/50 tracking-wide">
                                    Items in trash are permanently deleted after 30 days
                                </div>
                            </div>
                            <Button
                                onClick={handleDeleteAllTrashedQuizzes}
                                className={cn(
                                    'rounded-[4px] h-9 exec-button-dark tracking-wide text-light-base flex items-center text-[13px]',
                                )}
                            >
                                <IoTrashBinOutline className="mb-px size-4" />
                                Empty Trash
                            </Button>
                        </div>

                        <div className="flex flex-col w-full gap-y-2.5 overflow-y-auto">
                            {trashedQuizzes.map((quiz) => {
                                const template = templates.find((t) => t.id === quiz?.theme);
                                const formattedTime = quiz.deletedAt
                                    ? moment(quiz.deletedAt).format('MMM D, YYYY')
                                    : '';

                                return (
                                    <div
                                        key={quiz.id}
                                        className="dark:bg-neutral-800/40 bg-light-base rounded-[8px] relative flex items-center gap-x-3 p-2 border dark:border-neutral-800/40 border-neutral-300 group"
                                    >
                                        <div className="flex items-center gap-x-3 w-[75%] h-full">
                                            {/* theme */}
                                            {template && (
                                                <div className="relative group flex items-center gap-x-2">
                                                    <EmptyCanvas
                                                        className="w-20 h-14 !rounded-[11px] border border-neutral-400/50 dark:border-none cursor-auto"
                                                        template={template}
                                                    />
                                                </div>
                                            )}

                                            {/* quiz title and dates */}
                                            <div className="flex items-between justify-start gap-x-2.5 px-1 h-full">
                                                <div className="min-w-0 flex flex-col items-around justify-between h-full py-1">
                                                    <span className="block text-normal truncate">
                                                        {quiz.title}
                                                    </span>

                                                    <span className="block dark:text-light-base/60 text-black/60 text-[13px] flex items-center gap-x-3 tracking-wide">
                                                        <span>Deleted at {formattedTime}</span>
                                                        {quiz.daysLeftUntilPermanentDeletion !=
                                                            null && (
                                                            <>
                                                                <span className="h-3 w-px bg-black/30 dark:bg-white/30" />
                                                                <span
                                                                    className={cn(
                                                                        'text-[13px]',
                                                                        quiz.daysLeftUntilPermanentDeletion <=
                                                                            3
                                                                            ? 'text-red-500 dark:text-red-400'
                                                                            : 'dark:text-light-base/60 text-dark-base/80',
                                                                    )}
                                                                >
                                                                    {
                                                                        quiz.daysLeftUntilPermanentDeletion
                                                                    }{' '}
                                                                    day
                                                                    {quiz.daysLeftUntilPermanentDeletion !==
                                                                    1
                                                                        ? 's'
                                                                        : ''}{' '}
                                                                    left
                                                                </span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* delete and restore buttons */}
                                        <div className="flex-1 h-full flex items-center justify-end gap-x-5 pr-5">
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRestoreQuiz(quiz.id);
                                                }}
                                                className="flex items-center gap-x-0.5 dark:hover:bg-dark-alpha/70 hover:bg-neutral-300 px-1 pr-2.5 py-1 rounded-[4px] cursor-pointer text-light-base/80 opacity-0 group-hover:opacity-100 transition-all transform duration-200"
                                            >
                                                <Button className="h-7 w-7 text-xs bg-transparent dark:text-light-base/80 text-dark-base/80 hover:bg-transparent rounded-[4px] flex items-center shadow-none">
                                                    <IoMdRefresh
                                                        style={{ transform: 'scaleX(-1)' }}
                                                        className="mb-px size-5"
                                                    />
                                                </Button>
                                                <div className="text-[14px] tracking-wide dark:text-light-base/80 text-dark-base/80">
                                                    Restore
                                                </div>
                                            </div>

                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePermanentlyDeleteQuiz(quiz.id);
                                                }}
                                                className="flex items-center gap-x-0.5 dark:hover:bg-dark-alpha/70 hover:bg-neutral-300 px-1 pr-2.5 py-1 rounded-[4px] cursor-pointer text-light-base/80 opacity-0 group-hover:opacity-100 transition-all transform duration-200"
                                            >
                                                <Button className="h-7 w-7 text-xs bg-transparent dark:text-light-base/80 text-dark-base/80 hover:bg-transparent rounded-[4px] flex items-center shadow-none">
                                                    <MdDelete className="mb-0.5 size-4.5 stroke-1.2" />
                                                </Button>
                                                <div className="text-[14px] tracking-wide dark:text-light-base/80 text-dark-base/80">
                                                    Delete
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {trashedQuizzes.length === 0 && (
                                <div className="col-span-full w-full h-full min-h-[50vh] flex flex-col items-center justify-center">
                                    <Lottie
                                        animationData={emptyTrashAnimation}
                                        loop
                                        className="w-50 h-50"
                                    />

                                    <div className="text-black/60 dark:text-light-base/60 text-lg tracking-wide">
                                        Trash is empty
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </UtilityCard>
            </OpacityBackground>
        </AnimatePresence>
    );
}
