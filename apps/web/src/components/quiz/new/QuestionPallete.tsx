'use client';

import MiniCanvas from '@/components/canvas/MiniCanvas';
import { Button } from '@/components/ui/button';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import UtilityCard from '@/components/utility/UtilityCard';
import { Template, templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useSideBarStore } from '@/store/new-quiz/useSideBar';
import { QuizType } from '@nocturn/types';
import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import { TbPlus } from 'react-icons/tb';
import gsap from 'gsap';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';

export default function QuestionPallete() {
    const { quiz, currentQuestionIndex, setCurrentQuestionIndex, addQuestion, removeQuestion } =
        useNewQuizStore();
    const currentQTemplate = templates.find((t) => t.id === quiz.theme);
    const { handleCollaboratorsQuestionChange } = useWebSocket();
    console.log("quesiton is : ", quiz.questions);
    function handleQuestionChange(questionID: number) {
        console.log('Changing question to index:', questionID);
        setCurrentQuestionIndex(questionID);
        handleCollaboratorsQuestionChange({ questionIndex: questionID });
    }

    return (
        <>
            <BigQuestionPallete
                quiz={quiz}
                currentQuestionIndex={currentQuestionIndex}
                handleQuestionChange={handleQuestionChange}
                addQuestion={addQuestion}
                removeQuestion={removeQuestion}
                currentQTemplate={currentQTemplate}
            />
            <SmallQuestionPallete
                quiz={quiz}
                currentQuestionIndex={currentQuestionIndex}
                handleQuestionChange={handleQuestionChange}
                addQuestion={addQuestion}
                removeQuestion={removeQuestion}
                currentQTemplate={currentQTemplate}
            />
        </>
    );
}

interface QuestionPallete {
    quiz: QuizType;
    currentQuestionIndex: number;
    handleQuestionChange: (index: number) => void;
    addQuestion: () => void;
    removeQuestion: (index: number) => void;
    currentQTemplate: Template | undefined;
}

function BigQuestionPallete({
    quiz,
    currentQuestionIndex,
    handleQuestionChange,
    addQuestion,
    removeQuestion,
    currentQTemplate,
}: QuestionPallete) {
    return (
        <UtilityCard className="hidden lg:flex max-w-40 w-full shadow-none rounded-sm bg-neutral-200 dark:bg-dark-alpha p-0 flex-col items-center px-1 border-none h-full">
            <Button
                onClick={addQuestion}
                className={cn(
                    'bg-dark-base dark:bg-neutral-200 dark:hover:bg-light-base hover:bg-dark-alpha ',
                    'rounded-full m-0 mt-4 px-20 text-xs font-light flex items-center justify-center gap-x-2',
                )}
            >
                <TbPlus />
                <span>Add Question</span>
            </Button>

            <div className="flex flex-col gap-y-1.5 mt-4 pt-4 w-full flex-1 overflow-y-auto custom-scrollbar pr-1 relative" data-lenis-prevent>
                {quiz.questions.map((question, idx) => (
                    <div key={idx} className="gap-x-2 shrink-0 grid grid-cols-[8%_auto] items-end">
                        <div className="text-xs pb-2">{idx + 1}.</div>
                        <ToolTipComponent side="right" content={idx + 1}>
                            <MiniCanvas
                                removeQuestion={removeQuestion}
                                currentQuestionIndex={currentQuestionIndex}
                                handleQuestionChange={handleQuestionChange}
                                template={currentQTemplate}
                                question={question}
                                questionIndex={idx}
                            />
                        </ToolTipComponent>
                    </div>
                ))}
            </div>
        </UtilityCard>
    );
}

function SmallQuestionPallete({
    quiz,
    currentQuestionIndex,
    handleQuestionChange,
    addQuestion,
    removeQuestion,
    currentQTemplate,
}: QuestionPallete) {
    const { appearing, setAppearing } = useSideBarStore();
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (appearing) {
            gsap.fromTo(
                sidebarRef.current,
                {
                    x: -300,
                },
                {
                    x: 0,
                    duration: 0.2,
                    ease: 'power2.inOut',
                },
            );
        }
    }, [appearing]);

    const handleClose = () => {
        gsap.fromTo(
            sidebarRef.current,
            {
                x: 0,
            },
            {
                x: -300,
                duration: 0.2,
                ease: 'power2.inOut',
                onComplete: () => setAppearing(false),
            },
        );
    };

    return (
        <UtilityCard
            ref={sidebarRef}
            className={cn(
                'absolute left-0 top-0 z-40 flex max-w-44 w-full shadow-none rounded-sm bg-neutral-200/80 dark:bg-dark-alpha/80 backdrop-blur-lg p-0 flex-col items-center px-1 border-none h-full',
                `${appearing ? '' : 'hidden'}`,
            )}
        >
            <div className="w-full flex justify-center items-center gap-x-2 mt-4">
                <Button
                    onClick={addQuestion}
                    className={cn(
                        'bg-dark-base dark:bg-neutral-200 dark:hover:bg-light-base hover:bg-dark-alpha ',
                        'rounded-full m-0 px-20 text-xs font-light flex items-center justify-center gap-x-2',
                    )}
                >
                    <TbPlus />
                    <span>Add Question</span>
                </Button>
                <FiX size={20} onClick={handleClose} className="cursor-pointer" />
            </div>

            <div className="flex flex-col gap-y-1.5 mt-6 w-[90%] flex-1 overflow-y-auto custom-scrollbar pr-1 relative" data-lenis-prevent>
                {quiz.questions.map((question, idx) => (
                    <div key={idx} className="flex items-end gap-x-2 flex-shrink-0">
                        <div className="text-xs">{idx + 1}.</div>
                        <ToolTipComponent side="right" content={idx + 1}>
                            <MiniCanvas
                                removeQuestion={removeQuestion}
                                currentQuestionIndex={currentQuestionIndex}
                                handleQuestionChange={handleQuestionChange}
                                template={currentQTemplate}
                                question={question}
                                questionIndex={idx}
                                onClick={handleClose}
                            />
                        </ToolTipComponent>
                    </div>
                ))}
            </div>
        </UtilityCard>
    );
}
