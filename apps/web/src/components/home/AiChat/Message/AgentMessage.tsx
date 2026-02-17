import { cn } from '@/lib/utils';
import TimeDisplay from './TimeDisplay';

interface AgentMessageProps {
    content: string;
    createdAt: Date;
}

export default function AgentMessage({ content, createdAt }: AgentMessageProps) {
    return (
        <div className="flex justify-start w-full">
            <div className="flex items-start gap-x-2 max-w-[70%]">
                <div className="flex flex-col">
                    <div
                        className={cn(
                            'px-4 py-2 rounded-tr-xl rounded-b-xl text-sm font-normal',
                            'text-dark-alpha dark:text-light-alpha',
                            'bg-white border border-dark-base/10 dark:border-light-base/10',
                            'text-left tracking-wider mt-2.5',
                            'max-w-full min-w-0',
                        )}
                    >
                        <div className="w-full min-w-0 wrap-break-words whitespace-pre-wrap">
                            {content}
                        </div>

                        <div className="w-full flex justify-end ">
                            <TimeDisplay date={createdAt} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
