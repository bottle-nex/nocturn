'use client';

import { QuizType } from '@nocturn/types';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import QuizTitleChangePanel from './QuizTitleChangePanel';
import QuizOptionsPanel, { LoadingAction } from './QuizOptionsPanel';
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
    bulkDeleting?: boolean;
}

export default function MyQuizzesListView({
    formattedTime,
    quiz,
    isSelected,
    selectionMode,
    toggleQuizSelection,
    bulkDeleting,
}: MyQuizzesListViewProps) {
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { updateQuiz } = useAllQuizsStore();
    const [showQuizTitleChangePanel, setShowQuizTitleChangePanel] = useState<boolean>(false);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [quizAction, setQuizAction] = useState<LoadingAction>(null);

    const isLocked = bulkDeleting || quizAction !== null;

    function handleClick() {
        if (isLocked) return;
        if (selectionMode) return toggleQuizSelection(quiz.id);
        router.push(`/new/${quiz.id}`);
    }

    function handleEditTitle(e: React.ChangeEvent<HTMLInputElement>) {
        if (isLocked) return;
        e.stopPropagation();
        updateQuiz(quiz.id, { title: e.target.value });
    }

    async function handleSaveTitle() {
        if (isLocked) return;
        if (!session?.user.token || !quiz.title?.trim()) return;

        setEditingTitle(false);
        await QuizActions.change_quiz_title(session.user.token, quiz.id, quiz.title.trim());
    }

    return (
        <div
            onClick={handleClick}
            className={cn(
                'rounded-lg flex items-center gap-x-3 p-2 border group transition-opacity',
                isSelected ? 'border-indigo-800' : 'border-neutral-300 dark:border-neutral-800/40',
                isLocked && 'pointer-events-none opacity-90',
            )}
        >
            <div className="relative">
                <EmptyCanvas className="w-20 h-14 rounded-lg!" template={quiz.template} />

                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isLocked) return;
                        toggleQuizSelection(quiz.id);
                    }}
                    className={cn(
                        'absolute top-1 left-1 transition-all',
                        selectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                        isLocked && 'pointer-events-none opacity-50',
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
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="border-none outline-none w-60 truncate bg-transparent"
                        />
                    ) : (
                        <div className="truncate">{quiz.title}</div>
                    )}

                    <div className="text-sm opacity-60">Created at {formattedTime}</div>
                </div>

                {!selectionMode && (
                    <QuizOptionsPanel
                        disabled={isLocked}
                        setQuizAction={setQuizAction}
                        quiz={quiz}
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
