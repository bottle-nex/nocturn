'use client';

import EmptyCanvas from '@/components/canvas/EmptyCanvas';
import MiniCanvas from '@/components/canvas/MiniCanvas';
import OpacityBackground from '@/components/utility/OpacityBackground';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { templates } from '@/lib/templates';
import { cn } from '@/lib/utils';
import { QuestionType, QuizType, TemplateEnum } from '@nocturn/types';
import { useState } from 'react';
import { LiaPagerSolid } from 'react-icons/lia';
import { RxCross2 } from 'react-icons/rx';

interface PreviewQuizProps {
    quiz?: QuizType;
    onPreviewClose: () => void;
    fetchFromServer?: boolean;
    quizId?: string;
}

export default function PreviewQuiz({ quiz, onPreviewClose }: PreviewQuizProps) {
    const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(
        quiz?.questions[0] || null,
    );

    const [currentTheme, setCurrentTheme] = useState<string>(quiz?.theme || TemplateEnum.CLASSIC);
    const [previewTheme, setPreviewTheme] = useState<string | null>(null);
    const [themePanel, setThemePanel] = useState(false);

    const activeTheme = previewTheme ?? currentTheme;
    const template = templates.find((t) => t.id === activeTheme);

    return (
        <OpacityBackground onBackgroundClick={onPreviewClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    'max-h-full w-fit flex flex-col gap-y-3 p-6 rounded-beta bg-dark-base',
                    'border border-neutral-700 text-light-alpha',
                )}
            >
                {/* HEADER */}
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
                        Previewing {quiz?.questions.length}{' '}
                        {quiz?.questions.length === 1 ? 'slide' : 'slides'}
                    </div>

                    <div className="flex gap-x-3">
                        <div
                            className="px-3 py-1.5 rounded-beta bg-light-alpha text-dark-alpha cursor-pointer"
                            onClick={onPreviewClose}
                        >
                            Cancel
                        </div>
                        <div className="px-3 py-1.5 rounded-beta bg-alpha text-light-alpha cursor-pointer">
                            Continue
                        </div>
                    </div>
                </div>

                {/* TITLE */}
                <div className="w-full py-5 px-6 rounded-beta border border-neutral-700 flex justify-center">
                    {quiz?.title}
                </div>

                <div className="h-full flex items-start gap-x-3">
                    {/* QUESTIONS */}
                    {quiz?.questions.map((q, i) => (
                        <div key={i} className="w-30 flex items-end gap-x-2 shrink-0">
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

                    {/* CANVAS */}
                    <div className="w-150">
                        <EmptyCanvas
                            template={template!}
                            question={currentQuestion?.question}
                            options={currentQuestion?.options}
                            className={cn(
                                'w-full aspect-video rounded-[10px] outline-2 select-none',
                                'outline-black/40 dark:outline-white/40',
                            )}
                        />
                    </div>
                </div>
            </div>
        </OpacityBackground>
    );
}

interface ChangeThemePanelProps {
    currentTheme: string;
    onThemeChange: (theme: string) => void;
    onThemeHover: (theme: string | null) => void;
    onClose: () => void;
}

function ChangeThemePanel({
    currentTheme,
    onThemeChange,
    onThemeHover,
    onClose,
}: ChangeThemePanelProps) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'absolute top-10 left-0 w-90 p-4 z-10',
                'bg-dark-base border border-neutral-700 rounded-beta',
                'flex flex-col gap-y-2',
            )}
        >
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <span>Themes</span>
                <RxCross2
                    className="cursor-pointer hover:text-neutral-300 transition"
                    onClick={onClose}
                />
            </div>

            {/* GRID */}
            <div
                className="grid grid-cols-3 gap-3 overflow-y-auto max-h-72"
                onMouseLeave={() => onThemeHover(null)}
            >
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onThemeChange(template.id)}
                        onMouseEnter={() => onThemeHover(template.id)}
                        className={cn(
                            'flex flex-col items-center p-1 rounded-[9px] cursor-pointer',
                            currentTheme === template.id && 'bg-dark-alpha',
                        )}
                    >
                        <div className="w-24">
                            <EmptyCanvas
                                options={Array.from({ length: 4 })}
                                template={template}
                                className={cn(
                                    'w-full aspect-video rounded-[8px] outline-2 select-none',
                                    'outline-black/40 dark:outline-white/40',
                                    currentTheme === template.id && 'outline-alpha',
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
