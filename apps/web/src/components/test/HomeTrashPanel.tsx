'use client';
import { AnimatePresence } from 'framer-motion';
import OpacityBackground from '../utility/OpacityBackground';
import UtilityCard from '../utility/UtilityCard';
import { Button } from '../ui/button';
import Lottie from 'lottie-react';
import EmptyCanvas from '../canvas/EmptyCanvas';
import moment from 'moment';
import { templates } from '@/lib/templates';
import emptyTrashAnimation from '../../assets/lottie/empty-trash.json';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from 'sonner';
import { useAllTrashedQuizzesStore } from '@/store/user/useAllTrashedQuizzesStore';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { IoMdRefresh } from 'react-icons/io';
import { Input } from '../ui/input';
import { PiMagnifyingGlass, PiTrashSimple } from 'react-icons/pi';
import ToolTipComponent from '../utility/TooltipComponent';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import Image from 'next/image';
import { MdDeleteSweep } from 'react-icons/md';

export default function HomeTrashPanel() {
    const { trashedQuizzes, resetTrashQuizStore, setAllTrashedQuizzes, removeTrashedQuizById } =
        useAllTrashedQuizzesStore();
    const { addQuiz } = useAllQuizsStore();
    const { setActiveTab } = useHomeSidebarStore();
    const { session } = useUserSessionStore();
    const [searchQuery, setSearchQuery] = useState<string>('');

    const filteredQuizzes = trashedQuizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

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

                // fetchig trashed quizzes
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
                <UtilityCard className="max-w-[70vw] mx-auto w-full h-[80vh] rounded-md bg-white dark:bg-dark-alpha/70 border-none p-8 overflow-hidden">
                    <div className="flex flex-col w-full h-full gap-y-6 relative px-2">
                        <div className="flex w-full justify-between items-center">
                            <div className="flex flex-col justify-center -space-y-0.5">
                                <div className="text-xl dark:text-nlighter text-ndarkest tracking-wide">
                                    Trashed Quizzes
                                </div>
                                <div className="text-sm text-light-base/50 tracking-wide">
                                    Items in trash are permanently deleted after 30 days
                                </div>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <div
                                    className={cn(
                                        'relative w-md h-10 rounded-beta',
                                        'border-dark-base dark:border-neutral-700 dark:bg-zinc-800 dark:text-white',
                                    )}
                                >
                                    <Input
                                        placeholder="search trashed quizzes"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className={cn(
                                            'h-full w-full pl-10 rounded-beta',
                                            'placeholder:text-dark-base/60 dark:placeholder:text-neutral-500',
                                            'dark:bg-dark-base! bg-light-base! border-neutral-800',
                                        )}
                                    />

                                    <PiMagnifyingGlass
                                        size={20}
                                        className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                                    />
                                </div>
                                <ToolTipComponent content="Empty Trash">
                                    <Button
                                        variant={'outline'}
                                        size={'icon'}
                                        onClick={handleDeleteAllTrashedQuizzes}
                                        className={cn(
                                            'rounded-alpha bg-red-700/60! hover:bg-red-700/40! tracking-wide text-light-base flex items-center text-[13px] shadow-sm aspect-square',
                                        )}
                                    >
                                        <MdDeleteSweep className="mb-px size-4" />
                                    </Button>
                                </ToolTipComponent>
                            </div>
                        </div>

                        <div
                            className="w-full h-full overflow-y-auto custom-scrollbar mt-2"
                            data-lenis-prevent
                        >
                            {filteredQuizzes.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4 pb-4">
                                    {filteredQuizzes.map((quiz) => {
                                        const template = templates.find(
                                            (t) => t.id === quiz?.theme,
                                        );
                                        const formattedTime = quiz.deletedAt
                                            ? moment(quiz.deletedAt).format('MMM D, YYYY')
                                            : '';

                                        if (!template) return null;

                                        return (
                                            <div
                                                key={quiz.id}
                                                className="max-w-100 w-full p-1 flex flex-col relative group"
                                                data-lenis-prevent
                                            >
                                                <div
                                                    className={cn(
                                                        'absolute top-5 z-50 right-5 flex justify-end gap-x-2 w-full transition-all duration-100',
                                                        'opacity-0 group-hover:opacity-100',
                                                    )}
                                                >
                                                    <div className="flex gap-x-2.5 items-center">
                                                        <ToolTipComponent content="restore">
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRestoreQuiz(quiz.id);
                                                                }}
                                                                className="bg-light-base/70 backdrop-blur-sm text-dark-base h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                                                            >
                                                                <IoMdRefresh
                                                                    style={{
                                                                        transform: 'scaleX(-1)',
                                                                    }}
                                                                    className="size-5"
                                                                />
                                                            </div>
                                                        </ToolTipComponent>
                                                        <ToolTipComponent content="delete permanently">
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePermanentlyDeleteQuiz(
                                                                        quiz.id,
                                                                    );
                                                                }}
                                                                className="bg-light-base/70 backdrop-blur-sm text-red-600 h-8 w-8 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs cursor-pointer"
                                                            >
                                                                <PiTrashSimple className="size-5 stroke-2" />
                                                            </div>
                                                        </ToolTipComponent>
                                                    </div>
                                                </div>

                                                <EmptyCanvas
                                                    question={quiz.questions?.[0]?.question}
                                                    options={quiz.questions?.[0]?.options}
                                                    className={cn(
                                                        'w-full aspect-video rounded-[8px] outline-2 select-none cursor-default',
                                                        'outline-black/40 dark:outline-white/40',
                                                    )}
                                                    template={template}
                                                />

                                                <div className="flex items-center gap-x-2.5 mt-3 w-full overflow-hidden">
                                                    {quiz.host?.image && (
                                                        <Image
                                                            src={quiz.host.image}
                                                            width={32}
                                                            height={32}
                                                            alt="user-logo"
                                                            className="rounded-full"
                                                        />
                                                    )}
                                                    <div className="flex flex-col h-full">
                                                        <span className="block text-normal text-dark-base dark:text-light-base truncate w-[50%]">
                                                            {quiz.title}
                                                        </span>
                                                        <div className="flex items-center gap-x-2">
                                                            <span className="block dark:text-white/60 text-black/60 text-[13px]">
                                                                Deleted {formattedTime}
                                                            </span>
                                                            {quiz.daysLeftUntilPermanentDeletion !=
                                                                null && (
                                                                <>
                                                                    <span className="h-3 w-px bg-black/30 dark:bg-white/30" />
                                                                    <span
                                                                        className={cn(
                                                                            'text-[13px] font-medium',
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="col-span-full w-full h-full min-h-[50vh] flex flex-col items-center justify-center">
                                    <Lottie
                                        animationData={emptyTrashAnimation}
                                        loop
                                        className="w-50 h-50"
                                    />
                                    <div className="text-black/60 dark:text-light-base/60 text-lg tracking-wide">
                                        {searchQuery ? 'No quizzes found' : 'Trash is empty'}
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
