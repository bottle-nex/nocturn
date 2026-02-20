import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { TemplateType } from '@nocturn/types';
import { useRef } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';
import { cn } from '@/lib/utils';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import ThemePreview from './ThemePreview';

export default function ThemesDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, setIsHoveringTheme } = useNewQuizStore();
    const { updateQuizAndBroadcast } = useCollaborativeEdit();
    const { templates } = useQuizTemplatesStore();

    const selectedTemplateId = quiz.templateId;

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function changeThemeHandler(template: TemplateType) {
        setIsHoveringTheme(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            updateQuizAndBroadcast({
                template: template,
                templateId: template.id,
            });
        }, 500);
    }

    return (
        <div className="text-neutral-900 dark:text-neutral-100 select-none">
            <div className="w-full flex items-center justify-between border-b border-neutral-300 dark:border-neutral-700 pb-2">
                <div className="text-lg font-medium">Themes</div>
                <RxCross2 onClick={() => setState(DraftRenderer.NONE)} className="cursor-pointer" />
            </div>

            <div className="w-full px-2 mt-6">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-alpha dark:text-light-base">
                        Themes
                    </span>
                    <ToolTipComponent content="Enable spectator mode for your audience to ask questions and interact with you">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>

                <div className="flex w-full items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Choose theme template
                    </span>
                </div>
            </div>

            <div className="mt-4 px-2 pb-4 pt-2 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                    {templates.map((template) => {
                        const isActive = selectedTemplateId === template.id;

                        return (
                            <div
                                key={template.id}
                                onMouseEnter={() => changeThemeHandler(template)}
                                onMouseLeave={() => {
                                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                    setIsHoveringTheme(false);
                                }}
                                className="flex flex-col items-center gap-y-1 p-0 w-full h-auto rounded-[9px] cursor-pointer"
                            >
                                <ThemePreview
                                    active={isActive}
                                    className={cn(
                                        'outline-1 outline-offset-2 transition-all duration-200',
                                        isActive
                                            ? 'outline-indigo-600'
                                            : 'outline-neutral-500 hover:outline-neutral-400',
                                    )}
                                    template={template}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
