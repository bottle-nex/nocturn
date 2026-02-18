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
    const { messages } = useAiChatStore();
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
                        loading={false}
                    />
                ))}
            </div>
        </div>
    );
}
