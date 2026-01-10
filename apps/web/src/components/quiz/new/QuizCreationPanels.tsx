'use client';
import QuizLeft from '@/components/quiz/new/QuizLeft';
import QuizRight from '@/components/quiz/new/QuizRight';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useEffect } from 'react';
interface QuizCreationPanelsProps {
    quizId: string;
}

export default function QuizCreationPanels({ quizId }: QuizCreationPanelsProps) {
    const { updateQuiz } = useNewQuizStore();

    useEffect(() => {
        updateQuiz({ id: quizId[0] });
    }, [quizId, updateQuiz]);

    return (
        <div className="w-full h-full flex flex-row flex-1 dark:bg-dark-prime bg-neutral-200 overflow-hidden">
            <QuizLeft />
            <QuizRight />
        </div>
    );
}
