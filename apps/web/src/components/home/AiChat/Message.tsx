import { JSX, useState } from 'react';
import Image from 'next/image';
import { FiCopy, FiCheck, FiClock } from 'react-icons/fi';
import { formatChatTime } from '@/lib/format-chat-time';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { AiQuizChatRole, AiQuizMessage } from '@nocturn/types';
import { cn } from '@/lib/utils';

interface BuilderMessageProps {
    message: AiQuizMessage;
    loading: boolean;
}

export default function Message({
    message,
    loading,
}: BuilderMessageProps): JSX.Element {

    const [copiedId, setCopiedId] = useState<string | null>(null);

    async function handleCopy(text: string, id: string) {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    function TimeDisplay({ date }: { date: Date }) {
        return (
            <div className="flex items-center gap-1 text-[10px] text-neutral-100 ">
                <span>{formatChatTime(new Date(date))}</span>
            </div>
        );
    }

    return (
        <div className="w-full shrink-0">
            {message.role === AiQuizChatRole.USER && (
                <div className="flex justify-end items-start w-full">
                    <div className="flex items-start gap-x-2 max-w-[70%]">
                        <div>
                            <div
                                className={cn(
                                    "pl-4 pr-2 py-2 rounded-b-[8px] rounded-tl-[8px] text-sm font-normal",
                                    "bg-linear-to-b from-[#7b56ff] to-[#6236ff] border-[#7b56ff] border text-light ",
                                    "flex flex-col items-end gap-y-1 min-w-0",
                                    "max-w-full break-normal "
                                )}
                            >
                                <div className="w-full min-w-0 break-words whitespace-pre-wrap">
                                    {message.content}
                                </div>

                                <TimeDisplay date={message.createdAt!} />
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {message.role === AiQuizChatRole.AGENT && (
                <div className="flex justify-start w-full">
                    <div className="flex items-start gap-x-2 max-w-[70%]">
                        <div className="flex flex-col">
                            <div
                                className={cn(
                                    "px-4 py-2 rounded-tr-[8px] rounded-b-[8px] text-sm font-normal",
                                    "bg-linear-to-b from-[#111212] to-[#121313] border border-neutral-800",
                                    "text-light/80 text-left tracking-wider mt-2.5",
                                    "max-w-full min-w-0"
                                )}
                            >
                                <div className="w-full min-w-0 break-words whitespace-pre-wrap">
                                    {message.content}
                                </div>

                                <TimeDisplay date={message.createdAt!} />
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {message.role === AiQuizChatRole.SYSTEM && (
                <div className="flex justify-start items-start w-full my-4 ">
                </div>
            )}
        </div>
    );
}