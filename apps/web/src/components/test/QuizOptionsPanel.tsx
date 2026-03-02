'use client';
import { QuizStatusEnum, QuizType } from '@nocturn/types';
import { PiPresentationChart, PiTrashSimple } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import { BiPencil } from 'react-icons/bi';
import { FaRegClone } from 'react-icons/fa6';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from '@/lib/toast';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import QuizStatusTicker from '../tickers/QuizstatusTicker';
import ToolTipComponent from '../utility/TooltipComponent';
import { Dispatch, SetStateAction, useState } from 'react';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import { Button } from '../ui/button';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoadingAction = null | 'duplicate' | 'delete';

interface QuizOptionsPanelProps {
    setQuizAction: (val: LoadingAction) => void;
    quiz: QuizType;
    setEditingTitle?: Dispatch<SetStateAction<boolean>>;
    setShowQuizTitleChangePanel?: (val: boolean) => void;
    setShowPreview?: (val: boolean) => void;

    disabled?: boolean;
}

export default function QuizOptionsPanel({
    setQuizAction,
    quiz,
    setEditingTitle,
    disabled,
}: QuizOptionsPanelProps) {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { deleteQuiz, addQuiz } = useAllQuizsStore();
    const { deleteQuiz: deleteRecentlyViewed } = useRecentlyViewedQuizStore();
    const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);

    const locked = disabled || loadingAction !== null;

    function safePush() {
        if (locked) return;
        router.push(`/new/${quiz.id}`);
    }

    function safeRename() {
        if (locked) return;
        setEditingTitle?.(true);
    }

    async function handleDeleteQuiz(quizId: string) {
        if (!session?.user.token || loadingAction || disabled) return;
        try {
            setLoadingAction('delete');
            setQuizAction('delete');
            const res = await QuizActions.delete_quiz(session.user.token, quizId);
            if (res) {
                deleteQuiz(quizId);
                deleteRecentlyViewed(quizId);
                toast.success('Deleted quiz successfully');
            }
        } finally {
            setLoadingAction(null);
            setQuizAction(null);
        }
    }

    async function handleDuplicateQuiz(quizId: string) {
        if (!session?.user.token || loadingAction || disabled) return;
        try {
            setLoadingAction('duplicate');
            setQuizAction('duplicate');
            const duplicatedQuiz = await QuizActions.duplicate_quiz(session.user.token, quizId);
            if (duplicatedQuiz) addQuiz(duplicatedQuiz);
        } finally {
            setLoadingAction(null);
            setQuizAction(null);
        }
    }

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'flex gap-x-2.5 items-center z-10',
                locked && 'pointer-events-none opacity-60',
            )}
        >
            {(quiz.status === QuizStatusEnum.LIVE ||
                quiz.status === QuizStatusEnum.PUBLISHED ||
                quiz.status === QuizStatusEnum.COMPLETED) && (
                <QuizStatusTicker className="rounded-[px]!" status={quiz.status} />
            )}

            {quiz.status === QuizStatusEnum.COMPLETED && (
                <ToolTipComponent content="results">
                    <Button
                        disabled={locked}
                        onClick={safePush}
                        className="bg-light-base hover:bg-light-base/70 text-dark-base h-6 w-6 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs"
                    >
                        <PiPresentationChart className="size-3" />
                    </Button>
                </ToolTipComponent>
            )}

            <ToolTipComponent content="rename">
                <Button
                    disabled={locked}
                    onClick={safeRename}
                    className="bg-light-base/70 hover:bg-light-base/70 text-dark-base h-6 w-6 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs"
                >
                    <BiPencil className="size-3" />
                </Button>
            </ToolTipComponent>

            <ToolTipComponent content="duplicate">
                <Button
                    disabled={locked}
                    onClick={() => handleDuplicateQuiz(quiz.id)}
                    className="bg-light-base/70 hover:bg-light-base/70 text-dark-base h-6 w-6 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs"
                >
                    {loadingAction === 'duplicate' ? (
                        <Loader className="animate-spin size-4" />
                    ) : (
                        <FaRegClone className="size-3" />
                    )}
                </Button>
            </ToolTipComponent>

            <ToolTipComponent content="delete">
                <Button
                    disabled={locked}
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="bg-light-base/70 hover:bg-light-base/70 text-pink-600 h-6 w-6 flex justify-center items-center rounded-alpha ring-1 ring-dark-base/10 shadow-xs"
                >
                    {loadingAction === 'delete' ? (
                        <Loader className="animate-spin size-4" />
                    ) : (
                        <PiTrashSimple className="size-3 stroke-3" />
                    )}
                </Button>
            </ToolTipComponent>
        </div>
    );
}
