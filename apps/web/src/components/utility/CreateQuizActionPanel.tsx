import { cn } from '@/lib/utils';
import UtilityCard from './UtilityCard';
import { Dispatch, SetStateAction, useRef } from 'react';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';

interface action {
    name: string;
    description?: string;
    icon: React.ReactNode;
    action?: () => void | Promise<void>;
}

interface CreateQuizActionPanelProps {
    setActionsPanel: Dispatch<SetStateAction<boolean>>;
    setCurrentAction: Dispatch<SetStateAction<string | null>>;
    actions: action[];
}

export default function CreateQuizActionPanel({
    setCurrentAction,
    setActionsPanel,
    actions,
}: CreateQuizActionPanelProps) {
    const ref = useRef<HTMLDivElement>(null);
    useHandleClickOutside([ref], setActionsPanel);

    const handleActionClick = async (action: action) => {
        setCurrentAction(action.name);
        setActionsPanel(false);

        if (action.action) {
            try {
                await action.action();
            } catch (error) {
                console.error(`Error executing action ${action.name}:`, error);
            }
        }
    };

    return (
        <UtilityCard
            ref={ref}
            className="absolute right-0 top-full mt-2 w-[20rem] bg-light-base border-[1px] border-neutral-300 rounded-md shadow-xl z-40 overflow-hidden p-0"
        >
            <div className="flex flex-col w-full gap-y-1">
                {actions.map((action, index) => (
                    <div
                        key={action.name}
                        onClick={() => handleActionClick(action)}
                        className={cn(
                            'flex flex-row items-start w-full gap-4 bg-transparent dark:hover:bg-dark-prime/20 hover:bg-dark-prime/10 text-left rounded-none border-none outline-none shadow-none focus:outline-none focus:ring-0 cursor-pointer',
                            index === 0 ? 'px-6 py-3 pt-5' : 'px-6 py-3',
                            index === actions.length - 1 ? 'pb-5' : '',
                        )}
                    >
                        <div className="text-dark-base dark:text-light-base w-6 h-6 flex items-center justify-center">
                            {action.icon}
                        </div>
                        <div className="flex flex-col items-start justify-center">
                            <span className="text-sm font-[3px] text-dark-base dark:text-light-base">
                                {action.name}
                            </span>
                            {action.description && (
                                <span className="text-neutral-600 dark:text-neutral-400 text-xs font-light">
                                    {action.description}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </UtilityCard>
    );
}
