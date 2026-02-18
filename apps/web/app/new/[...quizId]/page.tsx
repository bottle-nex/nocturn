'use client';
import CreateQuizNavBar from '@/components/navbars/CreateQuizNavbar';
import QuizCreationPanels from '@/components/quiz/new/QuizCreationPanels';
import { cleanWebSocketClient } from '@/lib/singleton-socket';
import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { CustomResponse, GetNewQuizResponse, QuizResponseType, TemplateType } from '@nocturn/types';
import axios from 'axios';
import { Loader } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { GET_OWNER_QUIZ_URL, GET_QUIZ_TEMPLATES } from 'routes/api_routes';

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
    const [allowance, setAllowance] = useState<AllowanceEnum>(AllowanceEnum.NONE);
    const { quizId } = use(params);
    const { session } = useUserSessionStore();
    const { updateQuiz, resetStore } = useNewQuizStore();
    const { setCollaborators } = useCollaboratorStore();
    const { setTemplates } = useQuizTemplatesStore();

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setAllowance(AllowanceEnum.LOADING);
                const { data } = await axios.get<CustomResponse<GetNewQuizResponse>>(
                    `${GET_OWNER_QUIZ_URL}/${quizId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user.token}`,
                        },
                        withCredentials: true,
                    },
                );

                if (data.success && data.data) {
                    switch (data.data.type) {
                        case QuizResponseType.QUIZ_FOUND:
                            if (data.data.quiz) {
                                const { pendingTemplate, setPendingTemplate } = useNewQuizStore.getState();
                                const quizData = pendingTemplate
                                    ? { ...data.data.quiz, template: pendingTemplate }
                                    : data.data.quiz;
                                updateQuiz(quizData);
                                if (pendingTemplate) setPendingTemplate(null);
                                setCollaborators(data.data.quiz.CollabSession?.collaborators || []);
                                setAllowance(AllowanceEnum.ALLOWED);
                            }
                            break;
                        case QuizResponseType.ACCESS_DENIED:
                            setAllowance(AllowanceEnum.NOT_ALLOWED);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId, session?.user.token, updateQuiz]);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const { data } = await axios.get<CustomResponse<TemplateType[]>>(
                    GET_QUIZ_TEMPLATES,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user.token}`,
                        },
                    },
                );

                if (data.data) {
                    setTemplates(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch templates: ', err);
                return;
            }
        }

        if (session?.user.token) {
            fetchTemplates();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId, session?.user.token]);

    useEffect(() => {
        return () => {
            resetStore();
            cleanWebSocketClient();
        };
    }, [resetStore]);
    return (
        <>
            {allowance === AllowanceEnum.ALLOWED && (
                <div className="h-screen max-h-screen w-full max-w-screen flex flex-col">
                    <div className="h-20">
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
