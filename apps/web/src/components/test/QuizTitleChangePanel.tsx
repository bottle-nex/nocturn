'use client';
import { GoArrowRight } from 'react-icons/go';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import OpacityBackground from '../utility/OpacityBackground';
import React, { useState } from 'react';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useAllQuizsStore } from '@/store/user/useAllQuizsStore';

interface QuizTitleChangePanelProps {
    quizId: string;
    setShowQuizTitleChangePanel: (val: boolean) => void;
}

export default function QuizTitleChangePanel({
    quizId,
    setShowQuizTitleChangePanel,
}: QuizTitleChangePanelProps) {
    const [quizTitle, setQuizTitle] = useState<string>('');
    const { session } = useUserSessionStore();
    const { updateQuiz } = useAllQuizsStore();

    async function handleChangeQUizTitle() {
        if (!session?.user.token) return;

        try {
            await QuizActions.change_quiz_title(session.user.token, quizId, quizTitle);
            updateQuiz(quizId, { title: quizTitle });
            setShowQuizTitleChangePanel(false);
        } catch (error) {
            console.error('Failed to change quiz title: ', error);
        }
    }

    return (
        <OpacityBackground onBackgroundClick={() => setShowQuizTitleChangePanel(false)}>
            <div className="h-44 w-120 border border-neutral-700/50 rounded-[8px] dark:bg-dark-base bg-light-base text-light-base flex flex-col p-6 justify-between relative">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col -space-y-1">
                        <div className="text-2xl dark:bg-clip-text dark:text-transparent dark:bg-linear-to-b dark:from-light-base dark:via-light-base/80 dark:to-light-base/30 text-dark-base">
                            Change Quiz Title
                        </div>
                        <div className="text-[15px] dark:text-light-base/40 text-dark-base/60">
                            Enter the name of your new quiz title
                        </div>
                    </div>
                    <div
                        onClick={() => setShowQuizTitleChangePanel(false)}
                        className="h-6 w-6 flex justify-center items-center dark:bg-light-alpha dark:hover:bg-light-alpha/90 bg-neutral-300 backdrop-blur-xl text-dark-base rounded-full ring-1 dark:ring-neutral-800 ring-neutral-400 shadow-xs cursor-pointer"
                    >
                        x
                    </div>
                </div>

                <div className="flex gap-x-2">
                    <Input
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="h-10 placeholder:tracking-wide rounded-[4px] focus:text-dark-base dark:focus:text-light-base border dark:border-neutral-700/50 border-dark-base/40"
                        placeholder="enter title here"
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleChangeQUizTitle();
                            }
                        }}
                    />
                    <Button
                        onClick={handleChangeQUizTitle}
                        className="h-10 w-10 flex justify-center items-center bg-indigo-700 text-light-base hover:bg-indigo-800 rounded-[4px]"
                    >
                        <GoArrowRight />
                    </Button>
                </div>
            </div>
        </OpacityBackground>
    );
}
