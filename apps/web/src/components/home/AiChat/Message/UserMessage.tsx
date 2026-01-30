import { cn } from '@/lib/utils';
import TimeDisplay from './TimeDisplay';

interface UserMessageProps {
    content: string;
    createdAt: Date;
}

export default function UserMessage({ content, createdAt }: UserMessageProps) {
    return (
        <div className="flex justify-end items-start w-full">
            <div className="flex items-start gap-x-2 max-w-[70%]">
                <div>
                    <div
                        className={cn(
                            'pl-4 pr-2 py-2 rounded-b-[8px] rounded-tl-[8px] text-sm font-normal',
                            'bg-linear-to-b from-[#7b56ff] to-[#6236ff] border-[#7b56ff] border text-light ',
                            'flex flex-col items-end gap-y-1 min-w-0',
                            'max-w-full break-normal ',
                        )}
                    >
                        <div className="w-full min-w-0 break-words whitespace-pre-wrap">
                            {content}
                        </div>

                        <TimeDisplay date={createdAt} />
                    </div>
                </div>
            </div>
        </div>
    );
}
