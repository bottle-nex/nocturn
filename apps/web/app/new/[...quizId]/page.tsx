'use client';
import CreateQuizNavBar from '@/components/navbars/CreateQuizNavbar';
import QuizCreationPanels from '@/components/quiz/new/QuizCreationPanels';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { QuizResponseType } from '@nocturn/types';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { GET_OWNER_QUIZ_URL } from 'routes/api_routes';

enum AllowanceEnum {
    ALLOWED = 'ALLOWED',
    NOT_ALLOWED = 'NOT_ALLOWED',
    LOADING = 'LOADING',
    NONE = 'NONE',
}
export interface NewProps {
    params: Promise<{
        quizId: string;
    }>;
}

export default function New({ params }: NewProps) {
    const { quizId } = use(params);
    const { session } = useUserSessionStore();
    const { quiz, updateQuiz, resetStore } = useNewQuizStore();
    const [allowance, setAllowance] = useState<AllowanceEnum>(AllowanceEnum.NONE);

    useEffect(() => {
        const fetchQuiz = async () => {
            setAllowance(AllowanceEnum.LOADING);
            try {
                const { data } = await axios.get(`${GET_OWNER_QUIZ_URL}/${quizId}`, {
                    headers: {
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                });

                if (data.success) {
                    switch (data.data.type as QuizResponseType) {
                        case QuizResponseType.QUIZ_FOUND:
                            setAllowance(AllowanceEnum.ALLOWED);
                            updateQuiz(data.data.quiz);
                            break;
                        case QuizResponseType.ACCESS_DENIED:
                            setAllowance(AllowanceEnum.NOT_ALLOWED);
                            break;
                        case QuizResponseType.QUIZ_NOT_EXIST:
                            setAllowance(AllowanceEnum.ALLOWED);
                            break;
                        default:
                            setAllowance(AllowanceEnum.NOT_ALLOWED);
                    }
                }
            } catch (error) {
                console.error('Error while fetching quiz', error);
            }
        };

        if (session?.user.token) {
            fetchQuiz();
        }
    }, [quizId, session?.user.token, updateQuiz]);

    useEffect(() => {
        return () => {
            resetStore();
        };
    }, [resetStore]);

    console.log('Quiz in store:', quiz);

    return (
        <>
            {allowance === AllowanceEnum.ALLOWED && (
                <div className="h-screen max-h-screen w-full max-w-screen flex flex-col">
                    <div className="h-20 ">
                        <CreateQuizNavBar />
                    </div>
                    <QuizCreationPanels quizId={quizId} />
                </div>
            )}
            {allowance === AllowanceEnum.NOT_ALLOWED && (
                <div className="flex items-center justify-center w-full">Not allowed</div>
            )}
            {allowance === AllowanceEnum.LOADING && (
                <div className="text-alpha w-screen h-screen flex items-center justify-center">
                    <Loader className="animate-spin" />
                </div>
            )}
        </>
    );
}
