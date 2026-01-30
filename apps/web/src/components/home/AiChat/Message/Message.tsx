import { JSX } from 'react';
import { formatChatTime } from '@/lib/format-chat-time';
import { AiQuizChatRole, AiQuizMessage } from '@nocturn/types';
import { cn } from '@/lib/utils';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import TimeDisplay from './TimeDisplay';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';

interface BuilderMessageProps {
    message: AiQuizMessage;
    loading: boolean;
}

export default function Message({ message }: BuilderMessageProps): JSX.Element {

    return (
        <div className="w-full shrink-0">
            {message.role === AiQuizChatRole.USER && (
                <UserMessage
                    content={message.content}
                    createdAt={message.createdAt}
                />
            )}

            {message.role === AiQuizChatRole.AGENT && (
                <AgentMessage
                    content={message.content} 
                    createdAt={message.createdAt}
                />
            )}

            {message.role === AiQuizChatRole.SYSTEM && message.content && (
                <div className="flex justify-start items-start w-full text-sm ">
                    <div className="flex items-start gap-x-2 max-w-[70%]">
                        <div
                            className={cn(
                                'px-4 py-2 rounded-tr-[8px] rounded-b-[8px] text-sm font-normal',
                                'bg-linear-to-b from-[#111212] to-[#121313] border border-neutral-800',
                                'text-light/80 text-left tracking-wider mt-2.5',
                                'max-w-full min-w-0',
                            )}
                        >
                            <div className="w-full min-w-0 break-words whitespace-pre-wrap">
                                {message.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
