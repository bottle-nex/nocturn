import ToolTipComponent from '@/components/utility/TooltipComponent';
import { templates } from '@/lib/templates';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { TemplateEnum } from '@nocturn/types';
import Image from 'next/image';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { RxCross2 } from 'react-icons/rx';

export default function ThemesDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, updateQuiz } = useNewQuizStore();
    function changeThemeHandler(theme: string) {
        updateQuiz({
            theme: theme as TemplateEnum,
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
                    <span className="text-sm font-normal text-dark-prime dark:text-light-base">
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
                    {templates.map((template, idx) => (
                        <div
                            onClick={() => changeThemeHandler(template.id)}
                            key={idx}
                            className={`flex flex-col items-center gap-y-1 p-0 w-full h-auto rounded-[9px]`}
                        >
                            <div
                                className={`w-full relative overflow-hidden rounded-[10px] flex items-center justify-center border dark:border-neutral-400 border-neutral-700 ${quiz.theme === template.id && 'border-2 border-purple-800 bg-neutral-200'}`}
                            >
                                <Image
                                    src={`/templates/${template.src}.png`}
                                    alt="template"
                                    width={160}
                                    height={120}
                                    className="rounded-md max-w-full max-h-full object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="text-center text-xs w-full ">{template.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
