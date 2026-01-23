'use client';
import { cn } from '@/lib/utils';
import React, { ForwardedRef } from 'react';
import { motion } from 'motion/react';
interface UtilityCardProps {
    children: React.ReactNode;
    className?: string;
    ref?: ForwardedRef<HTMLDivElement>;
    style?: React.CSSProperties;
}

export default function UtilityCard({ children, className, ref, style }: UtilityCardProps) {
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
                'border border-neutral-300 dark:border-neutral-700 shadow-lg px-4 py-2.5 rounded-xs',
                className,
            )}
            style={style}
        >
            {children}
        </motion.div>
    );
}
