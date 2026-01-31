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
    noTruncate?: boolean;
}

export default function EmptyCanvas({
    template,
    className,
    onClick,
    question,
    options = [],
    noTruncate = false,
}: EmptyCanvasProps) {
    const barColors = template.bars || [];
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [barHeights, setBarHeights] = useState<number[]>([]);

    useEffect(() => {
        if (!isHovered) {
            setBarHeights(options.map(() => 5));
            return;
        }

        setBarHeights(options.map(() => Math.random() * 60 + 20));

        const interval = setInterval(() => {
            setBarHeights(options.map(() => Math.random() * 60 + 20));
        }, 1600);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHovered, options.length]);

    const getOptionLetter = (index: number) => {
        return String.fromCharCode(65 + index);
    };

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                'w-full rounded-md p-0.5 cursor-pointer relative overflow-hidden',
                className,
            )}
            style={{ boxSizing: 'border-box' }}
        >
            {question && options.length > 0 && (
                <div className="absolute h-full w-full z-2 p-3 sm:p-6 md:p-8 py-4 sm:py-5 md:py-6 flex flex-col justify-between">
                    <div
                        style={{ color: template.text_color }}
                        className={cn(
                            "max-w-full text-xs sm:text-sm md:text-base font-medium p-0.5 sm:p-1",
                            !noTruncate && 'truncate',
                        )}
                    >
                        Q. {question}
                    </div>
                    <div className="flex items-end justify-around mt-3 sm:mt-4 md:mt-5 h-full w-full gap-x-2 sm:gap-x-4 md:gap-x-8 px-0.5 sm:px-1 pr-1 sm:pr-2">
                        {options.map((opt, idx) => {
                            const color = barColors[idx % barColors.length];
                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center justify-end flex-1 h-full min-w-0"
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
                                        className={cn(
                                            "mt-1 sm:mt-1.5 md:mt-2 text-[9px] sm:text-[10px] md:text-[11px] text-center w-8 sm:w-10 md:w-12",
                                            !noTruncate && 'truncate',
                                        )}
                                    >
                                        <span className="font-semibold">
                                            {getOptionLetter(idx)}.
                                        </span>{' '}
                                        <span className="hidden xs:inline">{opt}</span>
                                        <span className="inline xs:hidden">{opt.slice(0, 3)}</span>
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
