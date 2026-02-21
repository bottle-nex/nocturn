import { cn } from '@/lib/utils';
import { QuizType } from '@nocturn/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import Image from 'next/image';
import EmptyCanvas from '../canvas/EmptyCanvas';
import QuizActions from '@/lib/backend/home/quiz-actions';
import HeartButton from '../ui/HeartButton';
import QuizOptionsPanel from './QuizOptionsPanel';

interface MyQuizzesGridViewProps {
    formattedTime: string;
    quiz: QuizType;
    isSelected?: boolean;
    selectionMode?: boolean;
    toggleQuizSelection?: (quizId: string) => void;
    bulkDeleting?: boolean;
}

export default function MyQuizzesGridView({
    quiz,
    isSelected,
    selectionMode,
    toggleQuizSelection,
    formattedTime,
    bulkDeleting,
}: MyQuizzesGridViewProps) {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { updateQuizFavourite } = useAllQuizsStore();
    const [quizAction, setQuizAction] = useState<LoadingAction>(null);
    const isLocked = bulkDeleting || quizAction !== null;

    function handleCardClick() {
        if (isLocked) return;
        if (selectionMode) return toggleQuizSelection?.(quiz.id);
        router.push(`/new/${quiz.id}`);
    }

    async function handleFavouriteToggle(quizId: string, isFavourite: boolean) {
        if (!session?.user.token || selectionMode || isLocked) return;
        await QuizActions.toggle_favourite_quiz(session.user.token, quizId, isFavourite);
        updateQuizFavourite(quizId, isFavourite);
    }

    const showOptions = selectionMode || quizAction !== null;

    return (
        <div className="max-w-100 w-full p-1 flex flex-col relative group">
            <div
                className={cn(
                    'absolute top-5 z-20 pr-6 pl-4 flex justify-between w-full transition-all',
                    showOptions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isLocked) return;
                        toggleQuizSelection?.(quiz.id);
                    }}
                    className={cn('cursor-pointer', isLocked && 'pointer-events-none opacity-50')}
                >
                    {isSelected ? (
                        <MdCheckBox className="size-6 text-indigo-700" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="size-6 text-indigo-700" />
                    )}
                </div>

                {!selectionMode && (
                    <QuizOptionsPanel
                        disabled={isLocked}
                        setQuizAction={setQuizAction}
                        quiz={quiz}
                    />
                )}
            </div>

            <EmptyCanvas
                onClick={handleCardClick}
                question={quiz.questions[0]?.question}
                options={quiz.questions[0]?.options}
                className={cn(
                    'w-full aspect-video rounded-[8px] outline select-none transition-all duration-200',
                    isSelected ? 'outline-indigo-600' : 'outline-black/40 dark:outline-white/40',
                    isLocked && 'pointer-events-none opacity-80',
                )}
                template={quiz.template}
            />

            <div className="flex items-center gap-x-2.5 pt-2">
                {quiz.host?.image && (
                    <Image
                        src={quiz.host.image}
                        width={32}
                        height={32}
                        alt="user-logo"
                        className="rounded-full"
                    />
                )}

                <div className="flex items-center justify-between w-full mt-0.5">
                    <div className="flex flex-col">
                        <span className="block text-base">{quiz.title?.slice(0, 28)}…</span>
                        <span className="block text-xs text-light-base/70">
                            Created at {formattedTime}
                        </span>
                    </div>

                    <HeartButton
                        disabled={isLocked || selectionMode}
                        liked={quiz.isFavourite}
                        onToggle={(toggle) => handleFavouriteToggle(quiz.id, toggle)}
                    />
                </div>
            </div>
        </div>
    );
}
