'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface InstructionSectionHoverCardProps {
    icon: React.ReactElement;
    title: string;
    description: string;
    points: {
        color: string;
        point_title: string;
    }[];
    className?: string;
}

export default function InstructionSectionHoverCard({
    title,
    description,
    points,
    icon,
    className,
}: InstructionSectionHoverCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.85, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: -16, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.9, filter: 'blur(6px)' }}
            transition={{
                type: 'spring',
                stiffness: 280,
                damping: 22,
                mass: 0.7,
            }}
            className={cn(
                'absolute left-1/2 -translate-x-1/2 bottom-full mb-4',
                'h-60 w-60 rounded-3xl rotate-2 p-6',
                'bg-light-alpha ring-6 ring-dark-base/5',
                'dark:bg-dark-base dark:ring-white/10',
                'shadow-xl shadow-black/10 dark:shadow-black/30 z-50',
                'pointer-events-none',
                className,
            )}
        >
            <div className="relative h-full w-full flex flex-col gap-y-1">
                <div className="w-full flex gap-x-2.5 text-black/70 dark:text-white/70 items-center h-8 mb-3">
                    <div className="bg-[#3583ff20] h-8 w-8 flex justify-center items-center ring-1 ring-[#3583ff60] shadow-xs shadow-black/5 dark:shadow-white/5 rounded-sm text-[#3583ff]">
                        {icon}
                    </div>

                    <div className="flex flex-col justify-between overflow-hidden">
                        <div className="text-[14px]">{title}</div>
                        <div className="text-[11px]">{description}</div>
                    </div>
                </div>

                {points.map((point, i) => (
                    <React.Fragment key={i}>
                        <div className="flex gap-x-2.5 w-full h-8 items-center">
                            <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: point.color }}
                            />
                            <div className="text-[14px] text-black/60 dark:text-white/60">{point.point_title}</div>
                        </div>

                        {i !== points.length - 1 && (
                            <div className="w-full h-1 border-t border-dashed border-black/20 dark:border-white/20" />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </motion.div>
    );
}
