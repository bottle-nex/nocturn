import { Template } from '@/lib/templates';
import { cn } from '@/lib/utils';
import CanvasAccents from '../utility/CanvasAccents';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface EmptyCanvasProps {
    question?: string;
    options?: string[];
    template: Template;
    className?: string;
    onClick?: () => void;
}

export default function EmptyCanvas({
    template,
    className,
    onClick,
    question,
    options = [],
}: EmptyCanvasProps) {
    const barColors = template.bars || [];
    const [isHovered, setIsHovered] = useState(false);
    const [barHeights, setBarHeights] = useState<number[]>([]);

    useEffect(() => {
        if (!isHovered) {
            setBarHeights(options.map(() => 5));
            return;
        }

        setBarHeights(options.map(() => Math.random() * 60 + 20));

        const interval = setInterval(() => {
            setBarHeights(options.map(() => Math.random() * 60 + 20));
        }, 1500);

        return () => clearInterval(interval);
    }, [isHovered, options.length, options]);

    const getOptionLetter = (index: number) => {
        return String.fromCharCode(65 + index);
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn('w-full rounded-md p-0.5 cursor-pointer relative', className)}
            style={{ boxSizing: 'border-box' }}
        >
            {question && options.length > 0 && (
                <div className="absolute h-full w-full z-2 p-8 py-6 flex flex-col justify-between">
                    <div
                        style={{ color: template.text_color }}
                        className="truncate max-w-full text-sm font-medium p-1"
                    >
                        Q. {question}
                    </div>
                    <div className="flex items-end justify-around mt-5 h-full w-full gap-x-8 px-1 pr-2">
                        {options.map((opt, idx) => {
                            const color = barColors[idx % barColors.length];
                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center justify-end flex-1 h-full"
                                >
                                    <motion.div
                                        className="w-full rounded-xs"
                                        style={{
                                            backgroundColor: color,
                                        }}
                                        animate={{
                                            height: `${barHeights[idx] || 5}%`,
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            ease: 'easeInOut',
                                        }}
                                    />
                                    <span
                                        style={{ color: template.text_color }}
                                        className="mt-2 text-[11px] truncate text-center w-12"
                                    >
                                        <span className="font-semibold">
                                            {getOptionLetter(idx)}.
                                        </span>{' '}
                                        {opt}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <div
                style={{
                    backgroundColor: template.background_color,
                    color: template.text_color,
                }}
                className="w-full h-full rounded-md flex justify-center items-center relative group"
            >
                <CanvasAccents design={template.accent_type} accentColor={template.accent_color} />
            </div>
        </div>
    );
}
