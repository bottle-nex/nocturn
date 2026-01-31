import EmptyCanvas from "@/components/canvas/EmptyCanvas";
import { templates } from "@/lib/templates";
import { cn } from "@/lib/utils";
import { RxCross2 } from "react-icons/rx";



interface ChangeThemePanelProps {
    currentTheme: string;
    onThemeChange: (theme: string) => void;
    onThemeHover: (theme: string | null) => void;
    onClose: () => void;
}

export default function ChangeThemePanel({
    currentTheme,
    onThemeChange,
    onThemeHover,
    onClose,
}: ChangeThemePanelProps) {
    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
                'absolute top-10 left-0 w-[360px] p-4 z-10',
                'bg-dark-base border border-neutral-700 rounded-beta',
                'flex flex-col gap-y-2'
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
                onMouseLeave={() => onThemeHover(null)}
            >
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onThemeChange(template.id)}
                        onMouseEnter={() => onThemeHover(template.id)}
                        className={cn(
                            'flex flex-col items-center p-1 rounded-[9px] cursor-pointer',
                            currentTheme === template.id && 'bg-dark-alpha'
                        )}
                    >
                        <div className="w-24">
                            <EmptyCanvas
                                options={Array.from({ length: 4 })}
                                template={template}
                                className={cn(
                                    'w-full aspect-video rounded-[8px] outline-2 select-none',
                                    'outline-black/40 dark:outline-white/40',
                                    currentTheme === template.id && 'outline-alpha'
                                )}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

