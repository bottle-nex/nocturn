'use client';

import { cn } from '@/lib/utils';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import Message from './Message/Message';
import { useEffect, useRef } from 'react';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

interface MessagesRendererProps {
    className?: string;
}

export default function MessagesRenderer({ className }: MessagesRendererProps) {
    const { messages, loading, typingMessageIds } = useAiChatStore();
    const { session } = useUserSessionStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollRef.current) return;

        // Lenis-safe auto scroll
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    return (
        <div
            ref={scrollRef}
            data-lenis-prevent
            className={cn(
                'max-w-87.5 w-full h-130',
                'border border-neutral-800 rounded-xl bg-dark-alpha',
                'flex flex-col',
                'overflow-y-auto overflow-x-hidden custom-scrollbar',
                className,
            )}
        >
            <div className="flex flex-col gap-y-1 p-2">
                {messages.map((m, i) => (
                    <Message
                        image={session?.user.image}
                        key={m.id ?? i}
                        message={m}
                        isTyping={typingMessageIds.includes(m.id)}
                        loading={false}
                    />
                ))}

                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="flex items-start gap-x-2 max-w-[70%]">
                            <div className="flex flex-col">
                                <div
                                    className={cn(
                                        'px-4 py-3 rounded-tr-xl rounded-b-xl text-sm font-normal',
                                        'bg-light-alpha dark:bg-dark-alpha border border-dark-base/10 dark:border-light-base/10',
                                        'mt-2.5 flex gap-1.5 items-center justify-center',
                                    )}
                                >
                                    <div
                                        className="w-1.5 h-1.5 rounded-full bg-dark-base/50 dark:bg-light-base/50 animate-bounce"
                                        style={{ animationDelay: '0ms' }}
                                    />
                                    <div
                                        className="w-1.5 h-1.5 rounded-full bg-dark-base/50 dark:bg-light-base/50 animate-bounce"
                                        style={{ animationDelay: '150ms' }}
                                    />
                                    <div
                                        className="w-1.5 h-1.5 rounded-full bg-dark-base/50 dark:bg-light-base/50 animate-bounce"
                                        style={{ animationDelay: '300ms' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
