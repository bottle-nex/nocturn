import { cn } from '@/lib/utils';
import TimeDisplay from './TimeDisplay';
import { useEffect, useState } from 'react';
import { useAiChatStore } from '@/store/home/useAiChatStore';

interface AgentMessageProps {
    content: string;
    createdAt: Date;
    isTyping?: boolean;
    messageId?: string;
}

export default function AgentMessage({
    content,
    createdAt,
    isTyping,
    messageId,
}: AgentMessageProps) {
    const [displayedContent, setDisplayedContent] = useState(isTyping ? '' : content);
    const removeTypingMessage = useAiChatStore((state) => state.removeTypingMessage);

    useEffect(() => {
        if (!isTyping) {
            setDisplayedContent(content);
            return;
        }

        let i = 0;
        const interval = setInterval(() => {
            setDisplayedContent(content.substring(0, i + 1));
            i++;
            if (i >= content.length) {
                clearInterval(interval);
                if (messageId) {
                    removeTypingMessage(messageId);
                }
            }
        }, 15);

        return () => clearInterval(interval);
    }, [content, isTyping, messageId, removeTypingMessage]);

    return (
        <div className="flex justify-start w-full">
            <div className="flex items-start gap-x-2 max-w-[70%]">
                <div className="flex flex-col">
                    <div
                        className={cn(
                            'px-4 py-2 rounded-tr-xl rounded-b-xl text-sm font-normal',
                            'text-dark-alpha dark:text-light-alpha',
                            'bg-light-alpha dark:bg-dark-alpha border border-dark-base/10 dark:border-light-base/10',
                            'text-left tracking-wider mt-2.5',
                            'max-w-full min-w-0',
                        )}
                    >
                        <div className="w-full min-w-0 wrap-break-words whitespace-pre-wrap">
                            {displayedContent}
                        </div>

                        <div
                            className={cn(
                                'w-full flex justify-end ',
                                'text-dark-alpha dark:text-dark-alpha',
                            )}
                        >
                            <TimeDisplay date={createdAt} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
