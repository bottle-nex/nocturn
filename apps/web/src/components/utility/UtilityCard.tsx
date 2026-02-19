'use client';
import { cn } from '@/lib/utils';
import React, { ForwardedRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { RxCross2 } from 'react-icons/rx';

interface UtilityCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    ref?: ForwardedRef<HTMLDivElement>;
    onClose?: () => void;
    children?: ReactNode;
}

export default function UtilityCard({
    children,
    className,
    ref,
    style,
    onClose,
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
                'relative border border-neutral-300 dark:border-neutral-700 bg-light-alpha dark:bg-dark-alpha text-dark-alpha dark:text-light-alpha shadow-lg px-4 py-2.5 rounded-xs',
                className,
            )}
            style={style}
        >
            {onClose && (
                <button
                    type="button"
                    title="Close"
                    onClick={onClose}
                    className="absolute top-2 right-2 cursor-pointer"
                >
                    <RxCross2 />
                </button>
            )}
            {children}
        </motion.div>
    );
}
