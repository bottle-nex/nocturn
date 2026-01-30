'use client';

import { cn } from '@/lib/utils';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import Message from './Message/Message';
import { useEffect, useRef } from 'react';

interface MessagesRendererProps {
    className?: string;
}

export default function MessagesRenderer({ className = '' }: MessagesRendererProps) {
    const { messages } = useAiChatStore();
    const messageEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div
            data-lenis-prevent
            className={cn(
                'max-w-87.5 w-full h-130',
                'border border-neutral-800 rounded-xl bg-dark-alpha',
                'flex flex-col min-h-0 bg-red-600',
                'overlfow-y-auto overflow-x-hidden',
                className,
            )}
        >
            <div
                data-lenis-prevent
                className={cn(
                    "flex-1 flex flex-col justify-end gap-y-1 p-2 overflow-y-auto overflow-x-hidden min-h-0 ",
                )}>
                {messages.map((m, i) => (
                    <Message key={m.id ?? i} message={m} loading={false} />
                ))}
                <div ref={messageEndRef} />
            </div>
        </div>
    );
}
