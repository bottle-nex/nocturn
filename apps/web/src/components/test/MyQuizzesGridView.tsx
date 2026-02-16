import { cn } from '@/lib/utils';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { useRouter } from 'next/navigation';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import Image from 'next/image';
import { QuizType } from '@nocturn/types';
import HeartButton from '../ui/HeartButton';
import { useState } from 'react';
import QuizTitleChangePanel from './QuizTitleChangePanel';
import PreviewQuiz from '../home/AiChat/PreviewQuiz';
import QuizOptionsPanel from './QuizOptionsPanel';

interface MyQuizzesGridViewProps {
    formattedTime: string;
    quiz: QuizType;
    isSelected?: boolean;
    selectionMode?: boolean;
    toggleQuizSelection?: (quizId: string) => void;
}

export default function MyQuizzesGridView({
    quiz,
    isSelected,
    selectionMode,
    toggleQuizSelection,
    formattedTime,
}: MyQuizzesGridViewProps) {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { updateQuizFavourite } = useAllQuizsStore();
    const [showQuizTitleChangePanel, setShowQuizTitleChangePanel] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    function handleCardClick() {
        if (selectionMode) return toggleQuizSelection?.(quiz.id);
        router.push(`/new/${quiz.id}`);
    }

    async function handleFavouriteToggle(quizId: string, isFavourite: boolean) {
        if (!session?.user.token || selectionMode) return;
        await QuizActions.toggle_favourite_quiz(session.user.token, quizId, isFavourite);
        updateQuizFavourite(quizId, isFavourite);
    }

    return (
        <div className="max-w-100 w-full p-1 flex flex-col relative group">
            <div
                className={cn(
                    'absolute top-5 z-20 pr-6 pl-4 flex justify-between w-full transition-all',
                    selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                )}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleQuizSelection?.(quiz.id);
                    }}
                    className="cursor-pointer"
                >
                    {isSelected ? (
                        <MdCheckBox className="size-6 text-indigo-700" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="size-6 text-indigo-700" />
                    )}
                </div>

                {!selectionMode && (
                    <QuizOptionsPanel
                        quiz={quiz}
                        toggleQuizSelection={toggleQuizSelection}
                        setShowQuizTitleChangePanel={setShowQuizTitleChangePanel}
                        setShowPreview={setShowPreview}
                    />
                )}
            </div>

            <EmptyCanvas
                onClick={handleCardClick}
                question={quiz.questions[0].question}
                options={quiz.questions[0].options}
                className={cn(
                    'w-full aspect-video rounded-[8px] outline select-none',
                    isSelected ? 'outline-indigo-600' : 'outline-black/40 dark:outline-white/40',
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

                <div className="flex items-center justify-between w-full">
                    <div>
                        <span className="block text-normal mt-1">{quiz.title?.slice(0, 28)}…</span>
                        <span className="text-[13px] opacity-60">last viewed {formattedTime}</span>
                    </div>
                    <HeartButton
                        liked={quiz.isFavourite}
                        onToggle={(toggle) => handleFavouriteToggle(quiz.id, toggle)}
                    />
                </div>
            </div>

            {showQuizTitleChangePanel && (
                <QuizTitleChangePanel
                    quizId={quiz.id}
                    setShowQuizTitleChangePanel={setShowQuizTitleChangePanel}
                />
            )}

            {showPreview && (
                <PreviewQuiz
                    onPreviewClose={() => setShowPreview(false)}
                    quizId={quiz.id}
                    fetchFromServer
                />
            )}
        </div>
    );
}
