'use client';
import { AnimatePresence } from 'framer-motion';
import OpacityBackground from '../utility/OpacityBackground';
import UtilityCard from '../utility/UtilityCard';
import { Button } from '../ui/button';
import { MdDelete, MdOutlineRestore } from 'react-icons/md';
import Image from 'next/image';
import EmptyCanvas from '../canvas/EmptyCanvas';
import moment from 'moment';
import { templates } from '@/lib/templates';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from 'sonner';
import { useAllTrashedQuizzesStore } from '@/store/user/useAllTrashedQuizzesStore';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { useEffect } from 'react';
import { TbInfoTriangleFilled } from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';

export default function HomeTrashPanel() {
    const { trashedQuizzes, resetTrashQuizStore, setAllTrashedQuizzes, removeTrashedQuizById } =
        useAllTrashedQuizzesStore();
    const { addQuiz } = useAllQuizsStore();
    const { setBottomActiveTab } = useHomeSidebarStore();
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
                onBackgroundClick={() => setBottomActiveTab(null)}
            >
                <UtilityCard className="max-w-[70vw] mx-auto w-full h-[80vh] rounded-md bg-white dark:bg-dark-base border-none p-6 overflow-hidden">
                    <div className="flex flex-col w-full h-full gap-y-5 relative">
                        <div className="flex w-full justify-between items-center">
                            <div className="text-xl dark:text-nlighter text-ndarkest tracking-wide">
                                Trashed Quizzes
                            </div>
                            <div className="flex gap-x-3">
                                <div className="flex items-center gap-x-2 text-[13px] border border-neutral-400 bg-neutral-800/40 text-neutral-300 tracking-wider px-3 py-1 rounded-[4px]">
                                    <TbInfoTriangleFilled />
                                    Trashed quizzes are cleared up every 30 days.
                                </div>
                                <Button
                                    onClick={handleDeleteAllTrashedQuizzes}
                                    className="rounded-[6px] h-9 border border-[#CD0E0F80] bg-[#CD0E0F40] hover:bg-[#cd0e0f90] tracking-wide text-nlighter flex items-center text-[13px]"
                                >
                                    <MdDelete className="mb-px size-4" />
                                    Clean up
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2">
                            {trashedQuizzes.map((quiz) => {
                                const template = templates.find((t) => t.id === quiz?.theme);
                                const formattedTime = quiz.deletedAt
                                    ? moment(quiz.deletedAt).format('MMM D, YYYY')
                                    : '';

                                return (
                                    <div
                                        key={quiz.id}
                                        className="w-full rounded-sm p-3 hover:shadow-md transition-shadow relative"
                                    >
                                        {template && (
                                            <div className="relative group">
                                                <EmptyCanvas
                                                    className="w-full aspect-video outline-2 outline-black/40 dark:outline-white/40"
                                                    template={template}
                                                />

                                                <div
                                                    className={cn(
                                                        'absolute inset-0',
                                                        'bg-black/40 dark:bg-black/20',
                                                        'opacity-0 group-hover:opacity-100',
                                                        'transition-opacity duration-200',
                                                        'flex items-center justify-center',
                                                        'rounded-sm',
                                                        'z-20',
                                                    )}
                                                >
                                                    <div className="flex gap-x-2">
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRestoreQuiz(quiz.id);
                                                            }}
                                                            className="h-8 text-xs bg-white text-ndarkest hover:bg-neutral-100 rounded-[4px]"
                                                        >
                                                            <MdOutlineRestore className="mb-px size-4" />
                                                        </Button>

                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePermanentlyDeleteQuiz(
                                                                    quiz.id,
                                                                );
                                                            }}
                                                            className="h-8 text-xs bg-[#CD0E0F] text-white hover:bg-[#b30c0c] rounded-[4px]"
                                                        >
                                                            <MdDelete className="mb-px size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-start gap-x-2.5 px-1 mt-2">
                                            {quiz.host?.image && (
                                                <Image
                                                    src={quiz.host.image}
                                                    width={32}
                                                    height={32}
                                                    alt="user-logo"
                                                    className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-full"
                                                />
                                            )}

                                            <div className="min-w-0">
                                                <span className="block text-normal mt-1 truncate">
                                                    {quiz.title}
                                                </span>
                                                <span className="block dark:text-white/60 text-black/60 text-[13px]">
                                                    deleted at {formattedTime}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {trashedQuizzes.length === 0 && (
                                <div className="col-span-full w-full h-full min-h-[60vh] flex items-center justify-center text-black/60 dark:text-nlighter/70 text-xl">
                                    No trashed quizzes
                                </div>
                            )}
                        </div>
                    </div>
                </UtilityCard>
            </OpacityBackground>
        </AnimatePresence>
    );
}
