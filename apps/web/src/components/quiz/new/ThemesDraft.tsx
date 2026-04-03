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
import { FaCrown } from 'react-icons/fa6';
import { useState } from 'react';
import CustomThemeEditor from './CustomThemeEditor';
import { createPortal } from 'react-dom';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { FEATURE } from '@nocturn/premium';

export default function ThemesDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, setIsHoveringTemplate } = useNewQuizStore();
    const { updateQuizAndBroadcast } = useCollaborativeEdit();
    const { templates } = useQuizTemplatesStore();
    const { isEnabled } = useSubscription();

    const selectedTemplateId = quiz.templateId;
    const [isCustomEditorOpen, setIsCustomEditorOpen] = useState(false);

    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function hoverThemeHandler(template: TemplateType) {
        if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHoveringTemplate(template);
        }, 300);
    }

    function changeThemeHandler(template: TemplateType) {
        updateQuizAndBroadcast({
            template: template,
            templateId: template.id,
        });
        if (template.id !== 'CUSTOM') {
            setIsCustomEditorOpen(false);
        }
    }

    function createCustomThemeHandler() {
        if (!isEnabled(FEATURE.CUSTOM_THEME)) return;

        const base =
            selectedTemplateId === 'CUSTOM'
                ? quiz.template
                : templates.find((t) => t.id === selectedTemplateId) || templates[0];

        const customTemplate: TemplateType = {
            ...base,
            id: 'NEW_CUSTOM', // Let backend know it's a new or existing custom template instance
            name: 'CUSTOM',
        };

        updateQuizAndBroadcast({
            template: customTemplate,
            templateId: 'CUSTOM', // Standard UI mapping
        });
        setIsCustomEditorOpen(true);
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
                                onMouseEnter={() => hoverThemeHandler(template)}
                                onMouseLeave={() => {
                                    if (hoverTimeoutRef.current)
                                        clearTimeout(hoverTimeoutRef.current);
                                    leaveTimeoutRef.current = setTimeout(() => {
                                        setIsHoveringTemplate(null);
                                    }, 300);
                                }}
                                onClick={() => changeThemeHandler(template)}
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

                <div className="mt-8 flex flex-col items-start px-1 gap-y-2">
                    <div className="flex items-center gap-x-2">
                        <span className="text-sm font-medium">Custom Theme</span>
                        <FaCrown className="text-yellow-500" size={14} />
                    </div>
                    <button
                        onClick={createCustomThemeHandler}
                        disabled={!isEnabled(FEATURE.CUSTOM_THEME)}
                        className={cn(
                            'w-full text-sm font-medium py-2 rounded-md outline-1 outline outline-neutral-300 dark:outline-neutral-700 bg-white dark:bg-neutral-800 transition-all text-neutral-800 dark:text-neutral-200',
                            isEnabled(FEATURE.CUSTOM_THEME)
                                ? 'hover:bg-neutral-100 hover:dark:bg-neutral-700 cursor-pointer'
                                : 'opacity-50 cursor-not-allowed',
                        )}
                    >
                        Create your own
                    </button>
                    {!isEnabled(FEATURE.CUSTOM_THEME) && (
                        <p className="text-xs text-neutral-500 mt-1">
                            Upgrade to Premium to create custom themes.
                        </p>
                    )}
                </div>
            </div>

            {isCustomEditorOpen &&
                typeof document !== 'undefined' &&
                createPortal(
                    <CustomThemeEditor onClose={() => setIsCustomEditorOpen(false)} />,
                    document.body,
                )}
        </div>
    );
}
