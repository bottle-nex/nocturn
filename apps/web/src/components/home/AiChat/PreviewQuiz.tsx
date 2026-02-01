'use client';

import { useEffect, useState } from 'react';

import EmptyCanvas from '@/components/canvas/EmptyCanvas';
import MiniCanvas from '@/components/canvas/MiniCanvas';
import PreviewQuizSkeleton from '@/components/skeletons/PreviewQuizSkeleton';
import OpacityBackground from '@/components/utility/OpacityBackground';
import ToolTipComponent from '@/components/utility/TooltipComponent';

import QuizActions from '@/lib/backend/home/quiz-actions';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';

import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { QuestionType, QuizType, TemplateEnum } from '@nocturn/types';

import { LiaPagerSolid } from 'react-icons/lia';
import ChangeThemePanel from './ChangeThemePanel';
import { useRouter } from 'next/navigation';

interface PreviewQuizProps {
    quiz?: Partial<QuizType>;
    onPreviewClose: () => void;
    fetchFromServer?: boolean;
    quizId?: string;
}

export default function PreviewQuiz({
    quiz,
    onPreviewClose,
    fetchFromServer = false,
    quizId,
}: PreviewQuizProps) {
    const { session } = useUserSessionStore();

    const [loading, setLoading] = useState<boolean>(fetchFromServer);
    const [quizData, setQuizData] = useState<Partial<QuizType> | undefined>(quiz);


    async function fetchQuizData() {
        if (!session?.user.token || !quizId) return;

        try {
            setLoading(true);

            const data = await QuizActions.get_quiz_questions(
                session.user.token,
                quizId
            );

            setQuizData(data);
        } catch (err) {
            console.error('Failed to fetch quiz data', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!fetchFromServer) return;
        fetchQuizData();
    }, [fetchFromServer, quizId]);


    if (loading) {
        return <PreviewQuizSkeleton onPreviewClose={onPreviewClose} />;
    }

    if (!quizData) return null;

    return (
        <PreviewQuizWithData
            quiz={quizData}
            onPreviewClose={onPreviewClose}
        />
    );
}

function PreviewQuizWithData({
    quiz,
    onPreviewClose,
}: PreviewQuizProps) {

    console.log("quiz: ", quiz);
    
    const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(quiz?.questions?.[0] || null);

    const [currentTheme, setCurrentTheme] = useState<string>(quiz?.theme || TemplateEnum.CLASSIC);
    const [previewTheme, setPreviewTheme] = useState<string | null>(null);
    const [themePanel, setThemePanel] = useState(false);

    const activeTheme = previewTheme ?? currentTheme;
    const template = templates.find((t) => t.id === activeTheme);

    const router = useRouter();

    function handleOnContinue() {
        router.push(`/new/${quiz?.id}`); 
    }

    return (
        <OpacityBackground onBackgroundClick={onPreviewClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    'max-h-full w-fit flex flex-col gap-y-3 p-6 rounded-beta bg-dark-base',
                    'border border-neutral-700 text-light-alpha',
                )}
            >
                <div className="relative w-full flex justify-between items-center">
                    <div
                        className={cn(
                            'relative flex items-center gap-x-1 px-3 py-1.5',
                            'rounded-beta hover:bg-dark-alpha transition cursor-pointer',
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setThemePanel(true);
                        }}
                    >
                        <LiaPagerSolid size={20} />
                        <span>Change theme</span>

                        {themePanel && (
                            <ChangeThemePanel
                                currentTheme={currentTheme}
                                onThemeHover={setPreviewTheme}
                                onThemeChange={(theme) => {
                                    setCurrentTheme(theme);
                                    setPreviewTheme(null);
                                    setThemePanel(false);
                                }}
                                onClose={() => {
                                    setPreviewTheme(null);
                                    setThemePanel(false);
                                }}
                            />
                        )}
                    </div>

                    <div
                        className={cn(
                            'absolute left-1/2 -translate-x-1/2 text-4xl ',
                            'dark:bg-clip-text dark:text-transparent dark:bg-linear-to-b dark:from-light-base dark:via-light-base/80 dark:to-light-base/10',
                        )}
                    >
                        Previewing slides
                    </div>

                    <div className="flex gap-x-3">
                        <div
                            className="px-3 py-1.5 rounded-beta bg-light-alpha text-dark-alpha cursor-pointer"
                            onClick={onPreviewClose}
                        >
                            Cancel
                        </div>
                        <div
                            className="px-3 py-1.5 rounded-beta bg-alpha text-light-alpha cursor-pointer"
                            onClick={handleOnContinue}
                        >
                            Continue
                        </div>
                    </div>
                </div>

                <div className="w-full py-5 px-6 rounded-beta border border-neutral-700 flex justify-center">
                    {quiz?.title}
                </div>

                <div className="flex items-stretch gap-x-3">
                    <div
                        data-lenis-prevent
                        className="flex flex-col gap-y-3 shrink-0 w-30 max-h-85 overflow-y-auto"
                    >
                        {quiz?.questions?.map((q, i) => (
                            <div
                                key={i}
                                className="flex items-end gap-x-2"
                            >
                                <div className="text-xs mb-1">{i + 1}.</div>

                                <ToolTipComponent side="right" content={i + 1}>
                                    <MiniCanvas
                                        onClick={() => setCurrentQuestion(q)}
                                        currentQuestionIndex={currentQuestion?.orderIndex!}
                                        orderIndex={q.orderIndex}
                                        template={template}
                                        question={q}
                                        collaboratorHighlight={cn(
                                            'rounded-beta '
                                        )}
                                    />
                                </ToolTipComponent>
                            </div>
                        ))}
                    </div>

                    <div className="w-150 ">
                        <EmptyCanvas
                            template={template!}
                            question={currentQuestion?.question}
                            options={currentQuestion?.options}
                            className={cn(
                                'w-full aspect-video rounded-beta outline-2 select-none',
                                'outline-black/40 dark:outline-white/40'
                            )}
                            noTruncate
                        />
                    </div>
                </div>

            </div>
        </OpacityBackground>
    );
}
