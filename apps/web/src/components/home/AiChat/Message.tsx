import { JSX, useState } from 'react';
import Image from 'next/image';
import { FiCopy, FiCheck, FiClock } from 'react-icons/fi';
import { formatChatTime } from '@/lib/format-chat-time';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { AiQuizChatRole, AiQuizMessage } from '@nocturn/types';

interface BuilderMessageProps {
    message: AiQuizMessage;
    loading: boolean;
}

export default function Message({
    message,
    loading,
}: BuilderMessageProps): JSX.Element {
    const { session } = useUserSessionStore();
    const [collapsePanel, setCollapsePanel] = useState<boolean>(false);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    async function handleCopy(text: string, id: string) {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    function TimeDisplay({ date }: { date: Date }) {
        return (
            <div className="flex items-center gap-1 text-xs text-neutral-500">
                <FiClock size={12} />
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
                            <div className="px-4 py-2 rounded-b-[8px] rounded-tl-[8px] text-sm font-normal bg-linear-to-b from-[#7b56ff] to-[#6236ff] border-[#7b56ff] border text-light text-right mt-3">
                                {message.content}
                            </div>

                            <div className="flex justify-end items-center gap-2 mt-1">
                                <TimeDisplay date={message.createdAt!} />
                                <button
                                    type="button"
                                    className="text-xs cursor-pointer"
                                    onClick={() => handleCopy(message.content, message.id)}
                                >
                                    {copiedId === message.id ? (
                                        <FiCheck strokeWidth={2.5} size={12} color="#6c44fc" />
                                    ) : (
                                        <FiCopy size={12} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {message.role === AiQuizChatRole.AGENT && (
                <div className="flex justify-start w-full">
                    <div className="flex items-start gap-x-2 max-w-[70%]">
                        <div className="w-8 h-8 aspect-square rounded-full bg-dark border border-neutral-800 flex items-center justify-center">
                            {/* app logo */}
                            <div className='rounded-full '>

                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="px-4 py-2 rounded-tr-[8px] rounded-b-[8px] text-sm font-normal bg-linear-to-b from-[#111212]  to-[#121313] border border-neutral-800 text-light/80 text-left tracking-wider mt-2.5">
                                {message.content}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                                <TimeDisplay date={message.createdAt!} />

                                <button
                                    type="button"
                                    className="text-xs cursor-pointer"
                                    onClick={() => handleCopy(message.content, message.id)}
                                >
                                    {copiedId === message.id ? (
                                        <FiCheck size={12} color="#6c44fc" />
                                    ) : (
                                        <FiCopy size={12} />
                                    )}
                                </button>
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