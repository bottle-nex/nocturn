import { Template } from '@/lib/templates';
import { cn } from '@/lib/utils';
import CanvasAccents from '../utility/CanvasAccents';

interface EmptyCanvasProps {
    question?: string;
    options?: string[];
    template: Template;
    className?: string;
    onClick?: () => void;
}

export default function EmptyCanvas({
    template,
    className,
    onClick,
    question,
    options = [],
}: EmptyCanvasProps) {
    const barColors = template.bars || [];

    return (
        <div
            onClick={onClick}
            className={cn('w-full rounded-md p-0.5 cursor-pointer relative', className)}
            style={{ boxSizing: 'border-box' }}
        >
            {question && options.length > 0 && (
                <div className="absolute h-full w-full z-2 p-5 py-6 flex flex-col justify-between">
                    <div
                        style={{ color: template.text_color }}
                        className="truncate max-w-full text-sm font-medium p-1"
                    >
                        Q. {question}
                    </div>

                    <div className="flex items-end justify-around mt-5 h-full w-full gap-x-10 px-1 pr-2">
                        {options.map((opt, idx) => {
                            const color = barColors[idx % barColors.length];

                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center justify-end flex-1 h-full"
                                >
                                    <div
                                        className="w-full rounded-xs"
                                        style={{
                                            backgroundColor: color,
                                            height: '5%',
                                        }}
                                    />

                                    <span
                                        style={{ color: template.text_color }}
                                        className="mt-2 text-[10px] truncate text-center w-10"
                                    >
                                        {opt}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div
                style={{
                    backgroundColor: template.background_color,
                    color: template.text_color,
                }}
                className="w-full h-full rounded-[8px] flex justify-center items-center relative group"
            >
                <CanvasAccents design={template.accent_type} accentColor={template.accent_color} />
            </div>
        </div>
    );
}
