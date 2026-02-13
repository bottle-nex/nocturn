import EmptyCanvas from '@/components/canvas/EmptyCanvas';
import { cn } from '@/lib/utils';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import { TemplateType } from '@nocturn/types';
import { RxCross2 } from 'react-icons/rx';

interface ChangeThemePanelProps {
    currentTheme?: TemplateType;
    onThemeChange?: (theme: TemplateType) => void;
    onThemeHover?: (theme: TemplateType | null) => void;
    onClose: () => void;
}

export default function ChangeThemePanel({
    currentTheme,
    onThemeChange,
    onThemeHover,
    onClose,
}: ChangeThemePanelProps) {
    const { templates } = useQuizTemplatesStore();

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'absolute top-10 left-0 w-[360px] p-4 z-10',
                'bg-dark-base border border-neutral-700 rounded-beta',
                'flex flex-col gap-y-2',
            )}
        >
            <div className="flex justify-between items-center">
                <span>Themes</span>
                <RxCross2
                    className="cursor-pointer hover:text-neutral-300 transition"
                    onClick={onClose}
                />
            </div>

            <div
                className="grid grid-cols-3 gap-3 overflow-y-auto max-h-72"
                onMouseLeave={() => onThemeHover?.(null)}
            >
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onThemeChange?.(template)}
                        onMouseEnter={() => onThemeHover?.(template)}
                        className={cn(
                            'flex flex-col items-center p-1 rounded-[9px] cursor-pointer',
                            currentTheme?.id === template.id && 'bg-dark-alpha',
                        )}
                    >
                        <div className="w-24">
                            <EmptyCanvas
                                options={Array.from({ length: 4 })}
                                template={template}
                                className={cn(
                                    'w-full aspect-video rounded-[8px] outline-2 select-none',
                                    'outline-black/40 dark:outline-white/40',
                                    currentTheme?.id === template.id && 'outline-alpha',
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
