'use client';
import { cn } from '@/lib/utils';
import React, { ForwardedRef } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface UtilityCardProps extends HTMLMotionProps<'div'> {
    ref?: ForwardedRef<HTMLDivElement>;
}

export default function UtilityCard({
    children,
    className,
    ref,
    style,
    ...props
}: UtilityCardProps) {
    return (
        <motion.div
            {...props}
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
