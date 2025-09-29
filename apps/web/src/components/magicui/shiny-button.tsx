'use client';

import { cn } from '@/lib/utils';
import { motion, type MotionProps } from 'framer-motion';
import React from 'react';

const animationProps = {
    initial: { '--x': '100%', scale: 0.8 },
    animate: { '--x': '-100%', scale: 1 },
    whileTap: { scale: 0.95 },
    transition: {
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 1,
        type: 'spring',
        stiffness: 20,
        damping: 15,
        mass: 2,
        scale: {
            type: 'spring',
            stiffness: 200,
            damping: 5,
            mass: 0.5,
        },
    },
} as MotionProps;

interface ShinyButtonProps
    extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps>,
        MotionProps {
    children: React.ReactNode;
    className?: string;
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                className={cn(
                    'relative cursor-pointer rounded-full px-4 py-2 font-light backdrop-blur-xl border transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,var(--primary)/10%_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_var(--primary)/10%]',
                    // make the button a flex container
                    'flex items-center justify-center gap-x-1',
                    className,
                )}
                {...animationProps}
                {...props}
            >
                {/* Shiny text overlay */}
                <span
                    className="absolute inset-0 block rounded-full"
                    style={{
                        mask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude, linear-gradient(rgb(0,0,0), rgb(0,0,0))',
                        WebkitMask:
                            'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude, linear-gradient(rgb(0,0,0), rgb(0,0,0))',
                        backgroundImage:
                            'linear-gradient(-75deg,var(--primary)/10% calc(var(--x)+20%),var(--primary)/50% calc(var(--x)+25%),var(--primary)/10% calc(var(--x)+100%))',
                    }}
                />
                {/* Children wrapper for mask effect */}
                <span
                    className="relative flex items-center justify-center gap-x-1 text-[13px] text-[rgb(0,0,0,65%)] dark:text-white tracking-wide"
                    style={{
                        maskImage:
                            'linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))',
                        WebkitMaskImage:
                            'linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))',
                    }}
                >
                    {children}
                </span>
            </motion.button>
        );
    },
);

ShinyButton.displayName = 'ShinyButton';
