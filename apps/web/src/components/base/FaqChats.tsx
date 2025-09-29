'use client';

import { cn } from '@/lib/utils';
import { motion, useAnimation } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';

interface ChatMessageProps {
    text: string;
    side: 'left' | 'right';
    className?: string;
}

const ChatMessage = ({ text, side, className }: ChatMessageProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.8 });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start({
                opacity: 1,
                x: 0,
                transition: { type: 'spring', stiffness: 120, damping: 20 },
            });
        } else {
            controls.start({ opacity: 0, x: side === 'left' ? -100 : 100 });
        }
    }, [isInView, controls, side]);

    const initialX = side === 'left' ? -100 : 100;

    return (
        <motion.div
            initial={{ opacity: 0, x: initialX }}
            animate={controls}
            className={cn(
                'p-4 my-0.5 text-sm px-4 py-2 max-w-[22rem] w-fit flex items-center justify-centerf font-normal',
                side === 'left'
                    ? 'bg-neutral-900 text-neutral-200 self-start rounded-full'
                    : 'bg-neutral-200 text-black self-end rounded-xl border border-neutral-900',
                className,
            )}
        >
            <span>{side === 'left' && 'Q. '}</span>
            <motion.div ref={ref} className={cn('p-4 my-0.5 text-sm px-4 py-2 w-fit', className)}>
                {text}
            </motion.div>
        </motion.div>
    );
};

interface FaqChatsProps {
    className?: string;
    messages: { text: string; side: 'left' | 'right' }[];
}

export default function FaqChats({ className, messages }: FaqChatsProps) {
    return (
        <div className={cn('flex flex-col p-4 gap-y-4 max-w-[28rem] mx-auto', className)}>
            {messages.map((msg, index) => (
                <ChatMessage key={index} text={msg.text} side={msg.side} />
            ))}
        </div>
    );
}
