'use client';
import { AnimatePresence } from 'framer-motion';
import OpacityBackground from '../utility/OpacityBackground';
import UtilityCard from '../utility/UtilityCard';
import { Button } from '../ui/button';
import EmptyCanvas from '../canvas/EmptyCanvas';
import NoContent from '../ui/NoContent';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from '@/lib/toast';
import { useAllTrashedQuizzesStore } from '@/store/user/useAllTrashedQuizzesStore';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { PiMagnifyingGlass } from 'react-icons/pi';
import ToolTipComponent from '../utility/TooltipComponent';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { MdDeleteSweep } from 'react-icons/md';
import CanvasSkeletonCard from '@/components/skeletons/CanvasSkeleton';
import { Loader } from 'lucide-react';
import TrashPanelQuizActionsComponent from './TrashPanelComponents/TrashPanelQuizActionsComponent';
import TrashPanelDeleteConfirmationComponent from './TrashPanelComponents/TrashPanelDeleteConfimrationComponent';
import TrashPanelQuizImageAndTitleComponent from './TrashPanelComponents/TrashPanelQuizImageAndTitleComponent';

type PendingDeleteAction = { type: 'single'; quizId: string } | { type: 'bulk' };

export default function HomeTrashPanel({ onClose }: { onClose: () => void }) {
    const [clearingTrash, setClearingTrash] = useState<boolean>(false);
    const { trashedQuizzes, resetTrashQuizStore, setAllTrashedQuizzes, removeTrashedQuizById } =
        useAllTrashedQuizzesStore();
    const { addQuiz } = useAllQuizsStore();
    const { session } = useUserSessionStore();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [quizActionLoading, setQuizActionLoading] = useState<
        Record<string, 'restore' | 'delete' | null>
    >({});
    const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(new Set());
    const [pendingDelete, setPendingDelete] = useState<PendingDeleteAction | null>(null);

    function startQuizAction(id: string, type: 'restore' | 'delete') {
        setQuizActionLoading((prev) => ({ ...prev, [id]: type }));
    }

    function toggleSelectQuiz(id: string) {
        setSelectedQuizzes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function stopQuizAction(id: string) {
        setQuizActionLoading((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    }

    const filteredQuizzes = trashedQuizzes
        ? trashedQuizzes.filter((quiz) =>
              quiz.title.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : [];

    function requestDeleteAllOrSelected() {
        if (!session?.user.token || clearingTrash) return;
        if (trashedQuizzes.length === 0) {
            toast.error('trash is already cleared');
            return;
        }
        setPendingDelete({ type: 'bulk' });
    }

    function requestPermanentlyDeleteQuiz(quizId: string) {
        if (!session?.user.token || quizActionLoading[quizId]) return;
        setPendingDelete({ type: 'single', quizId });
    }

    function cancelDelete() {
        setPendingDelete(null);
    }

    async function confirmDelete() {
        if (!pendingDelete) return;
        if (pendingDelete.type === 'bulk') {
            const hasSelected = selectedQuizzes.size > 0;
            setClearingTrash(true);
            setPendingDelete(null);
            try {
                if (hasSelected) {
                    const ids = Array.from(selectedQuizzes);
                    await QuizActions.delete_selected_trashed_quizzes(session!.user.token, ids);
                    ids.forEach((id) => removeTrashedQuizById(id));
                    setSelectedQuizzes(new Set());
                    toast.success('Selected quizzes deleted');
                } else {
                    await QuizActions.delete_all_trashed_quizzes(session!.user.token);
                    resetTrashQuizStore();
                    toast.success('Cleared trash successfully');
                }
            } catch {
                toast.error('Failed to delete quizzes');
            } finally {
                setClearingTrash(false);
            }
        } else {
            const { quizId } = pendingDelete;
            setPendingDelete(null);
            startQuizAction(quizId, 'delete');
            try {
                const deletedQuiz = await QuizActions.permanently_delete_quiz(
                    session!.user.token,
                    quizId,
                );
                if (!deletedQuiz) return;
                removeTrashedQuizById(deletedQuiz.id);
                toast.success('Quiz permanently deleted');
            } catch {
                console.error('Failed to permanently delete quiz');
            } finally {
                stopQuizAction(quizId);
            }
        }
    }

    useEffect(() => {
        async function get_quiz_data() {
            if (!session?.user.token) return;
            setLoading(true);
            try {
                const res = await QuizActions.get_trashed_quizzes(session.user.token);
                setAllTrashedQuizzes(res || []);
            } finally {
                setLoading(false);
            }
        }
        get_quiz_data();
    }, [session?.user.token, setAllTrashedQuizzes]);

    async function handleRestoreQuiz(quizId: string) {
        if (!session?.user.token || quizActionLoading[quizId]) return;
        startQuizAction(quizId, 'restore');
        try {
            const restoredQuiz = await QuizActions.restore_trashed_quiz(session.user.token, quizId);
            if (!restoredQuiz) return;
            removeTrashedQuizById(restoredQuiz.id);
            addQuiz(restoredQuiz);
            toast.success('Quiz restored');
        } catch {
            console.error('Failed to restore quiz');
        } finally {
            stopQuizAction(quizId);
        }
    }

    const hasSelected = selectedQuizzes.size > 0;

    return (
        <AnimatePresence>
            <OpacityBackground className="bg-black/10 dark:bg-white/10" onBackgroundClick={onClose}>
                <UtilityCard className="max-w-[70vw] mx-auto w-full h-[80vh] rounded-md bg-white dark:bg-dark-alpha border-none p-8 overflow-hidden">
                    <div className="flex flex-col w-full h-full gap-y-6 relative px-2">
                        <div className="flex w-full justify-between items-center">
                            <div className="flex flex-col justify-center -space-y-0.5">
                                <div className="text-xl dark:text-nlighter text-ndarkest tracking-wide">
                                    Trashed Quizzes
                                </div>
                                <div className="text-sm dark:text-light-base/50 text-dark-alpha/50 tracking-wide">
                                    Items in trash are permanently deleted after 30 days
                                </div>
                            </div>
                            <div className="flex gap-x-2 items-center">
                                <div className="relative w-md h-10 rounded-beta border-dark-base dark:border-neutral-700 dark:bg-zinc-800 dark:text-white">
                                    <Input
                                        placeholder="search trashed quizzes"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-full w-full pl-10 rounded-beta placeholder:text-dark-base/60 dark:placeholder:text-neutral-500 dark:bg-dark-base! bg-light-base! dark:border-neutral-800 border-neutral-200"
                                    />
                                    <PiMagnifyingGlass
                                        size={20}
                                        className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
                                    />
                                </div>
                                <ToolTipComponent
                                    content={hasSelected ? 'Delete selected' : 'Empty Trash'}
                                >
                                    <Button
                                        variant={'outline'}
                                        size={hasSelected ? 'default' : 'icon'}
                                        onClick={requestDeleteAllOrSelected}
                                        disabled={clearingTrash}
                                        className={cn(
                                            'rounded-alpha bg-red-700 dark:bg-red-700/60! hover:bg-red-700/90 hover:dark:bg-red-700/40! tracking-wide text-light-base flex items-center gap-2 text-[13px] shadow-sm',
                                            !hasSelected && 'aspect-square',
                                        )}
                                    >
                                        {clearingTrash ? (
                                            <Loader className="animate-spin size-4" />
                                        ) : (
                                            <>
                                                <MdDeleteSweep className="mb-px size-4 text-light-base" />
                                                {hasSelected && (
                                                    <span className="text-light-base">
                                                        Delete Selected
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </Button>
                                </ToolTipComponent>
                            </div>
                        </div>
                        <div
                            className="w-full h-full overflow-y-auto custom-scrollbar mt-2"
                            data-lenis-prevent
                        >
                            {loading ? (
                                <div className="grid grid-cols-3 gap-4 pb-4">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <CanvasSkeletonCard key={i} />
                                    ))}
                                </div>
                            ) : filteredQuizzes.length > 0 ? (
                                <div className="grid grid-cols-3 gap-4 pb-4">
                                    {filteredQuizzes.map((quiz) => {
                                        const isOperating = !!quizActionLoading[quiz.id];
                                        const isSelected = selectedQuizzes.has(quiz.id);
                                        return (
                                            <div
                                                key={quiz.id}
                                                className="max-w-100 w-full p-1 flex flex-col relative group"
                                            >
                                                {/* actions-panel */}
                                                <TrashPanelQuizActionsComponent
                                                    quizId={quiz.id}
                                                    isOperating={isOperating}
                                                    isSelected={isSelected}
                                                    quizActionLoading={quizActionLoading}
                                                    toggleSelectQuiz={toggleSelectQuiz}
                                                    handleRestoreQuiz={handleRestoreQuiz}
                                                    handlePermanentlyDeleteQuiz={
                                                        requestPermanentlyDeleteQuiz
                                                    }
                                                />
                                                {/* quiz-canvas */}
                                                <EmptyCanvas
                                                    question={quiz.questions?.[0]?.question}
                                                    options={quiz.questions?.[0]?.options}
                                                    className="w-full aspect-video rounded-lg outline-2 select-none cursor-pointer outline-black/40 dark:outline-white/40"
                                                    template={quiz.template}
                                                    onClick={() => toggleSelectQuiz(quiz.id)}
                                                />
                                                {/* image and details */}
                                                <TrashPanelQuizImageAndTitleComponent quiz={quiz} />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <NoContent
                                    title={searchQuery ? 'No quizzes found' : 'Trash is empty'}
                                    description={
                                        searchQuery
                                            ? 'Try a different search term'
                                            : 'Items in trash are permanently deleted after 30 days'
                                    }
                                    className="col-span-full w-full h-full min-h-[50vh]"
                                />
                            )}
                        </div>
                    </div>
                    <TrashPanelDeleteConfirmationComponent
                        isOpen={!!pendingDelete}
                        onCancel={cancelDelete}
                        onConfirm={confirmDelete}
                    />
                </UtilityCard>
            </OpacityBackground>
        </AnimatePresence>
    );
}
