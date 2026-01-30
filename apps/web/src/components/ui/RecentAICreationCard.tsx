import { templates } from '@/lib/templates';
import EmptyCanvas from '../canvas/EmptyCanvas';

interface RecentAICreatedCardProps {
    theme: string;
    title: string;
    difficulty: number;
}

export default function RecentAICreatedCard({
    theme,
    title,
    difficulty,
}: RecentAICreatedCardProps) {
    const template = templates.find((t) => t.id === theme);

    return (
        <div className="w-full h-16 flex gap-x-2 px-2 py-2 hover:bg-neutral-900 transition cursor-pointer rounded-alpha">
            {/* <div
                className={cn(
                        "h-full w-12 rounded-alpha ",
                    )}
                style={{ backgroundColor: template?.background_color }}
            ></div> */}
            <EmptyCanvas
                className="w-12 aspect-video outline-2 outline-black/40 dark:outline-white/40"
                template={template!}
            />
            <div className="flex flex-col justify-around ">
                <div className="w-65 text-sm truncate">{title}</div>
                <div className="text-xs">
                    <span className="text-neutral-300 ">difficulty </span>
                    <span className="text-neutral-500 ">{difficulty}</span>
                </div>
            </div>
        </div>
    );
}
