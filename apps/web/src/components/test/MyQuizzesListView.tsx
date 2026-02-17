import { QuizType } from '@nocturn/types';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import QuizTitleChangePanel from './QuizTitleChangePanel';
import QuizOptionsPanel from './QuizOptionsPanel';
import PreviewQuiz from '../home/AiChat/PreviewQuiz';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import QuizActions from '@/lib/backend/home/quiz-actions';

interface MyQuizzesListViewProps {
    formattedTime: string;
    quiz: QuizType;
    isSelected: boolean;
    selectionMode: boolean;
    toggleQuizSelection: (quizId: string) => void;
}

export default function MyQuizzesListView({
    formattedTime,
    quiz,
    isSelected,
    selectionMode,
    toggleQuizSelection,
}: MyQuizzesListViewProps) {
    const router = useRouter();
    const [showQuizTitleChangePanel, setShowQuizTitleChangePanel] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const { session } = useUserSessionStore();
    const { updateQuiz } = useAllQuizsStore();

    function handleClick() {
        if (selectionMode) return toggleQuizSelection(quiz.id);
        router.push(`/new/${quiz.id}`);
    }

    function handleEditTitle(e: React.ChangeEvent<HTMLInputElement>) {
        e.stopPropagation();
        updateQuiz(quiz.id, { title: e.target.value });
    }

    async function handleSaveTitle() {
        if (!session?.user.token || !quiz.title?.trim()) return;
        setEditingTitle(false);
        await QuizActions.change_quiz_title(session.user.token, quiz.id, quiz.title.trim());
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                'rounded-lg flex items-center gap-x-3 p-2 border group cursor-pointer',
                isSelected ? 'border-indigo-800' : 'border-neutral-300 dark:border-neutral-800/40',
            )}
        >
            <div className="relative">
                <EmptyCanvas className="w-20 h-14 rounded-lg!" template={quiz.template} />

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleQuizSelection(quiz.id);
                    }}
                    className={cn(
                        'absolute top-1 left-1 transition-all',
                        selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                >
                    {isSelected ? (
                        <MdCheckBox className="size-6 text-indigo-700" />
                    ) : (
                        <MdCheckBoxOutlineBlank className="size-6 text-indigo-700" />
                    )}
                </div>
            </div>

            <div className="flex justify-between w-full">
                <div>
                    {editingTitle ? (
                        <input
                            value={quiz.title}
                            onChange={handleEditTitle}
                            onBlur={handleSaveTitle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle();
                            }}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Quiz title"
                            autoFocus
                            className="border-none outline-none w-60 truncate"
                        />
                    ) : (
                        <div className="truncate">{quiz.title}</div>
                    )}
                    <div className="text-sm opacity-60">Created at {formattedTime}</div>
                </div>

                {!selectionMode && (
                    <QuizOptionsPanel
                        quiz={quiz}
                        setEditingTitle={setEditingTitle}
                        toggleQuizSelection={toggleQuizSelection}
                        setShowQuizTitleChangePanel={setShowQuizTitleChangePanel}
                        setShowPreview={setShowPreview}
                    />
                )}
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
