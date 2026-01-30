import EmptyCanvas from "@/components/canvas/EmptyCanvas";
import MiniCanvas from "@/components/canvas/MiniCanvas";
import OpacityBackground from "@/components/utility/OpacityBackground";
import ToolTipComponent from "@/components/utility/TooltipComponent";
import { Template, templates } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { QuestionType, QuizType, TemplateEnum } from "@nocturn/types";
import Image from "next/image";
import { useState } from "react";
import { LiaPagerSolid } from "react-icons/lia";

interface PreviewQuizProps {
    quiz: QuizType;
    onPreviewClose: () => void;
}

export default function PreviewQuiz({ quiz, onPreviewClose }: PreviewQuizProps) {

    const [currentQuestion, setCurrentQuestion] = useState<QuestionType>(quiz?.questions[0]!);
    const [currentTheme, setCurrentTheme] = useState<string>(quiz.theme);

    const template = templates.find(t => t.id === currentTheme);

    return (
        <OpacityBackground onBackgroundClick={onPreviewClose}>
            <div
                className={cn(
                    'max-h-full w-fit flex flex-col gap-y-3 p-6 rounded-alpha bg-dark-base ',
                    'border border-neutral-700 text-light-alpha '
                )}
            >

                {/* headers */}
                <div className={cn(
                    "w-full flex justify-between items-center ",
                    'relative'
                )}>
                    <div
                        className={cn(
                            "relative flex justify-center items-center gap-x-1 ",
                            'px-3 py-1.5 rounded-alpha hover:bg-dark-alpha transition cursor-pointer'
                        )}
                    >
                        <LiaPagerSolid size={20} />
                        <div>
                            Change theme
                        </div>
                        <ChangeThemPanel
                            currentTheme={quiz?.theme!}
                            onThemeChange={(theme: string) => setCurrentTheme(theme)}
                            onThemeHover={(theme: string) => setCurrentTheme(theme)}
                        />
                    </div>
                    <div className={cn('absolute left-1/2 -translate-x-1/2')}>
                        Previewing Quiz
                    </div>
                    <div className="flex justify-between items-center gap-x-3 ">
                        <div
                            className="px-3 py-1.5 rounded-alpha bg-light-alpha text-dark-alpha cursor-pointer "
                            onClick={onPreviewClose}
                        >
                            Cancel
                        </div>
                        <div className="px-3 py-1.5 rounded-alpha bg-alpha text-light-alpha cursor-pointer ">
                            Continue
                        </div>
                    </div>
                </div>

                {/* title */}
                <div
                    className={cn(
                        'w-full bg-dark-base py-5 px-6 ',
                        'flex justify-center items-center ',
                        'rounded-alpha border border-neutral-700'
                    )}
                >
                    {quiz?.title}
                </div>

                <div className="flex items-start gap-x-3">

                    {/* questions */}
                    {quiz?.questions.map((q, i) => (
                        <div
                            key={i}
                            className="w-30 flex items-end gap-x-2 shrink-0"
                        >
                            <div className="text-xs">{i + 1}.</div>
                            <ToolTipComponent side="right" content={i + 1}>
                                <MiniCanvas
                                    onClick={() => setCurrentQuestion(q)}
                                    currentQuestionIndex={i}
                                    orderIndex={q.orderIndex}
                                    template={template}
                                    question={q}
                                />
                            </ToolTipComponent>
                        </div>
                    ))}

                    {/* canvas */}
                    <div className="w-150">
                        <EmptyCanvas
                            template={template!}
                            question={currentQuestion.question}
                            options={currentQuestion.options}
                            className={cn(
                                'max-w-150 w-full aspect-video rounded-[10px] outline-2 select-none',
                                'outline-black/40 dark:outline-white/40',
                            )}
                        />
                    </div>



                </div>

            </div>
        </OpacityBackground>
    );
}

interface ChangeThemPanelProps {
    currentTheme: string;
    onThemeChange: (theme: string) => void;
    onThemeHover: (theme: string) => void;
    className?: string
}

function ChangeThemPanel({ currentTheme, onThemeChange, onThemeHover, className }: ChangeThemPanelProps) {

    return (
        <div
            className={cn(
                'absolute top-10 left-0 w-90 p-4 z-10 bg-dark-base border border-neutral-700 rounded-alpha ',
                'grid grid-cols-3 gap-3',
                'overflow-y-auto',
                className
            )}
        >

            {templates.map((template, idx) => (
                <div
                    onClick={() => onThemeChange(template.id)}
                    key={idx}
                    className="flex flex-col items-center gap-y-1 p-1 rounded-[9px] cursor-pointer"
                    onMouseEnter={() => onThemeHover(template.id)}
                >
                    <div className="w-24">
                        <EmptyCanvas
                            options={Array(4)}
                            template={template}
                            className={cn(
                                'w-full aspect-video rounded-[10px] outline-2 select-none',
                                'outline-black/40 dark:outline-white/40',
                                currentTheme === template.id && 'outline-alpha',
                                'rounded-[8px] '
                            )}
                        />
                    </div>
                </div>


            ))}
        </div>
    );
}