'use client';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { PiMagnifyingGlass, PiTrashSimple } from 'react-icons/pi';
import { Button } from '../ui/button';
import { FiPlus } from 'react-icons/fi';
import { TbLayoutGridFilled } from 'react-icons/tb';
import { FaAlignJustify } from 'react-icons/fa6';
import { RiCircleLine, RiRecordCircleLine } from 'react-icons/ri';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useRouter } from 'next/navigation';
import { Layouts } from './MyQuizzesPanel';
import BackendActions from '@/lib/backend/new/quiz-backend-actions';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { toast } from '@/lib/toast';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import { QuizType } from '@nocturn/types';

interface QuizzesUpperSectionData {
    quizzes: QuizType[];
    onDeleteSelected?: () => Promise<void> | void;
    onCancelSelection?: () => void;
    selectedQuizes?: number;
    onToggleSelectAll?: () => void;
    isAllSelected?: boolean;
    activeLayoutTab?: Layouts;
    onLayoutChange?: (layout: Layouts) => void;
    isBulkDeleting?: boolean;
}

export default function QuizzesUpperSection({
    quizzes,
    isAllSelected,
    selectedQuizes,
    activeLayoutTab,
    onLayoutChange,
    onDeleteSelected,
    onCancelSelection,
    onToggleSelectAll,
    isBulkDeleting,
}: QuizzesUpperSectionData) {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { updateQuiz } = useNewQuizStore();
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleCreateQuiz() {
        if (!session?.user.token || creating || deleting || isBulkDeleting) return;
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

    async function handleDeleteSelected() {
        if (!onDeleteSelected || deleting || isBulkDeleting) return;
        setDeleting(true);
        try {
            await onDeleteSelected();
        } finally {
            setDeleting(false);
        }
    }

    const actionsDisabled = creating || deleting || isBulkDeleting;

    return (
        <div className="flex flex-col gap-y-6 relative justify-between items-start mt-10">
            <div className="flex justify-between gap-x-4 w-full">
                <div
                    className={cn(
                        'relative w-md h-11 rounded-beta',
                        'border-dark-base dark:border-neutral-700 dark:bg-zinc-800 dark:text-white',
                    )}
                >
                    <Input
                        placeholder="search quizzes"
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

                <Button
                    onClick={handleCreateQuiz}
                    disabled={actionsDisabled}
                    className="px-8 py-4.75 bg-nprimary dark:text-light-base font-medium rounded-xl shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15)] transition-shadow cursor-pointer flex items-center gap-3 border border-nprimary"
                >
                    {creating ? <Loader className="animate-spin size-4" /> : <FiPlus />}
                    <span>{creating ? 'Creating...' : 'New Quiz'}</span>
                </Button>
            </div>

            <div className="w-full flex justify-between items-center">
                {quizzes && quizzes.length > 0 && (
                    <div className="flex items-center gap-x-1 h-11">
                        <Button
                            disabled={actionsDisabled}
                            onClick={() => onLayoutChange?.(Layouts.GRID)}
                            className={cn(
                                'flex justify-center items-center rounded-sm border shadow-none hover:bg-indigo-600/20 h-7 w-7',
                                activeLayoutTab === Layouts.GRID
                                    ? 'bg-indigo-600/20 border-indigo-800/70'
                                    : 'border-transparent bg-indigo-600/5',
                            )}
                        >
                            <TbLayoutGridFilled
                                className={cn(
                                    'size-4',
                                    activeLayoutTab === Layouts.GRID
                                        ? 'text-indigo-700 dark:text-light-base'
                                        : 'text-indigo-900',
                                )}
                            />
                        </Button>

                        <Button
                            disabled={actionsDisabled}
                            onClick={() => onLayoutChange?.(Layouts.LIST)}
                            className={cn(
                                'flex justify-center items-center rounded-sm border shadow-none hover:bg-indigo-600/20 h-7 w-7',
                                activeLayoutTab === Layouts.LIST
                                    ? 'bg-indigo-600/20 border-indigo-800/70'
                                    : 'border-transparent bg-indigo-600/5',
                            )}
                        >
                            <FaAlignJustify
                                className={cn(
                                    'size-4',
                                    activeLayoutTab === Layouts.LIST
                                        ? 'text-indigo-700 dark:text-light-base'
                                        : 'text-indigo-900',
                                )}
                            />
                        </Button>

                        {(selectedQuizes ?? 0) > 0 && (
                            <div
                                onClick={actionsDisabled ? undefined : onToggleSelectAll}
                                className={cn(
                                    'pl-4 flex gap-x-1.5 select-none items-center text-light-base/80',
                                    actionsDisabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'cursor-pointer',
                                )}
                            >
                                {isAllSelected ? <RiRecordCircleLine /> : <RiCircleLine />}
                                <span className="text-lg text-light-base/80">select all</span>
                            </div>
                        )}
                    </div>
                )}

                {quizzes && quizzes.length > 0 && (selectedQuizes ?? 0) > 0 && (
                    <div className="flex items-center gap-x-3">
                        <Button
                            onClick={onCancelSelection}
                            disabled={actionsDisabled}
                            variant="outline"
                            className="rounded-sm h-11 px-5 !border-neutral-800"
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={handleDeleteSelected}
                            disabled={actionsDisabled}
                            className="rounded-sm h-11 px-5 bg-red-700 hover:bg-red-700/80 text-white flex items-center gap-x-2"
                        >
                            {deleting || isBulkDeleting ? (
                                <Loader className="animate-spin size-4" />
                            ) : (
                                <PiTrashSimple className="size-4.5 mb-px" />
                            )}
                            <span>
                                {deleting || isBulkDeleting
                                    ? 'Deleting selected'
                                    : `Delete selected (${selectedQuizes})`}
                            </span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
