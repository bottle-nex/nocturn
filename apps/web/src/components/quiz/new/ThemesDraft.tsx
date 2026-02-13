import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { TemplateEnum, TemplateType } from '@nocturn/types';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';
import EmptyCanvas from '@/components/canvas/EmptyCanvas';
import { cn } from '@/lib/utils';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';

export default function ThemesDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz } = useNewQuizStore();
    const { updateQuizAndBroadcast } = useCollaborativeEdit();
    const { templates } = useQuizTemplatesStore();

    function changeThemeHandler(template: TemplateType) {
        updateQuizAndBroadcast({
            template: template.id as TemplateEnum, // enum for persistence
            theme: template, // full object for rendering
        });
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

            <div className="mt-4 px-2 pb-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => changeThemeHandler(template)}
                            className="flex flex-col items-center gap-y-1 p-0 w-full h-auto rounded-[9px] cursor-pointer"
                        >
                            <EmptyCanvas
                                className={cn(
                                    'w-full aspect-video rounded-[8px] outline-black/40 dark:outline-white/40',
                                    quiz.theme?.id === template.id &&
                                        'outline-2 outline-indigo-800',
                                )}
                                template={template}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
