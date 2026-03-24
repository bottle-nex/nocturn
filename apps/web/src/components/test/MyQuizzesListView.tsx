'use client';

import { QuizType } from '@nocturn/types';
import EmptyCanvas from '../canvas/EmptyCanvas';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import QuizOptionsPanel, { LoadingAction } from './QuizOptionsPanel';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';
import QuizActions from '@/lib/backend/home/quiz-actions';

const TITLE_MAX_LENGTH = 50;

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
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [originalTitle, setOriginalTitle] = useState<string>('');
    const [quizAction, setQuizAction] = useState<LoadingAction>(null);

    const isLocked = bulkDeleting || quizAction !== null;
    const titleLength = quiz.title?.length ?? 0;
    const isTitleEmpty = !quiz.title?.trim();
    const isTitleOverLimit = titleLength > TITLE_MAX_LENGTH;
    const isTitleInvalid = isTitleEmpty || isTitleOverLimit;

    function handleStartEditing() {
        setOriginalTitle(quiz.title ?? '');
    }

    function handleClick() {
        if (isLocked || editingTitle) return;
        if (selectionMode) return toggleQuizSelection(quiz.id);
        router.push(`/new/${quiz.id}`);
    }

    function handleEditTitle(e: React.ChangeEvent<HTMLInputElement>) {
        if (isLocked) return;
        e.stopPropagation();
        if (e.target.value.length > 60) return;
        updateQuiz(quiz.id, { title: e.target.value });
    }

    async function handleSaveTitle() {
        if (isLocked || isTitleInvalid) return;
        if (!session?.user.token) return;
        setEditingTitle(false);
        await QuizActions.change_quiz_title(session.user.token, quiz.id, quiz.title.trim());
    }

    function handleCancelEditing() {
        updateQuiz(quiz.id, { title: originalTitle });
        setEditingTitle(false);
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

            <div className="flex justify-between w-full items-center">
                <div>
                    {editingTitle ? (
                        <div onClick={(e) => e.stopPropagation()}>
                            <input
                                aria-label="Edit quiz title"
                                value={quiz.title}
                                onChange={handleEditTitle}
                                onBlur={handleSaveTitle}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTitle();
                                    if (e.key === 'Escape') handleCancelEditing();
                                }}
                                autoFocus
                                className={cn(
                                    'border-none outline-none w-60 bg-transparent',
                                    isTitleOverLimit && 'text-red-500',
                                )}
                            />
                            {isTitleOverLimit && (
                                <p className="text-red-500 text-xs mt-0.5">
                                    Max {TITLE_MAX_LENGTH} characters
                                </p>
                            )}
                            {isTitleEmpty && (
                                <p className="text-red-500 text-xs mt-0.5">Title cannot be empty</p>
                            )}
                        </div>
                    ) : (
                        <div className="truncate">{quiz.title}</div>
                    )}

                    <div className="text-sm opacity-60">Created at {formattedTime}</div>
                </div>

                {!selectionMode && (
                    <QuizOptionsPanel
                        disabled={isLocked}
                        setQuizAction={setQuizAction}
                        setEditingTitle={setEditingTitle}
                        onStartEditing={handleStartEditing}
                        quiz={quiz}
                    />
                )}
            </div>
        </div>
    );
}
