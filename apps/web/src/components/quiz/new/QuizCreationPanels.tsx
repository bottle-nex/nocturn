'use client';
import QuizDashboardLeft from '@/components/quiz/new/QuizLeft';
import QuizDashboardRight from '@/components/quiz/new/QuizRight';
import QuestionPallete from '@/components/quiz/new/QuestionPallete';
import { useSubscribeEventHandlers } from '@/hooks/sockets/useSubscribeEventHandlers';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useEffect } from 'react';
interface QuizCreationPanelsProps {
    quizId: string;
}

export default function QuizCreationPanels({ quizId }: QuizCreationPanelsProps) {
    const { updateQuiz } = useNewQuizStore();

    useWebSocket();
    useSubscribeEventHandlers();

    useEffect(() => {
        updateQuiz({ id: quizId[0] });
    }, [quizId, updateQuiz]);

    return (
        <div className="w-full h-full flex flex-row flex-1 dark:bg-dark-alpha bg-neutral-200 overflow-hidden">
            <QuizDashboardLeft />
            <QuizDashboardRight />
            <QuestionPallete />
        </div>
    );
}
