import { cn } from '@/lib/utils';
import { InteractionEnum } from '@nocturn/types';

export default function Reactions({
    onReact,
    className,
}: {
    onReact: (reaction: InteractionEnum) => void;
    className?: string;
}) {
    const reactions = ['👍', '💲', '💡', '❤️', '😀'];
    const getReactionEnum = (emoji: string): InteractionEnum => {
        switch (emoji) {
            case '👍':
                return InteractionEnum.THUMBS_UP;
            case '💲':
                return InteractionEnum.DOLLAR;
            case '💡':
                return InteractionEnum.BULB;
            case '❤️':
                return InteractionEnum.HEART;
            case '😀':
                return InteractionEnum.SMILE;
            default:
                throw new Error(`Unknown emoji: ${emoji}`);
        }
    };

    return (
        <div
            className={cn(
                'absolute z-100 flex justify-center items-center gap-x-0.5 py-1 px-3 rounded-full border',
                'bg-white dark:bg-neutral-800 shadow-xl dark:border',
                'animate-in fade-in-0 zoom-in-95 duration-150',
                'whitespace-nowrap',
                className,
            )}
        >
            {reactions.map((reaction, index) => (
                <div
                    key={index}
                    className="cursor-pointer text-md hover:scale-110 transition-transform duration-150 px-1 py-0.5 rounded-full"
                    onClick={() => onReact(getReactionEnum(reaction))}
                >
                    {reaction}
                </div>
            ))}
        </div>
    );
}
