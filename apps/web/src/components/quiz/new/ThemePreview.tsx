'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TemplateType } from '@nocturn/types';
import { cn } from '@/lib/utils';
import CanvasAccents from '@/components/utility/CanvasAccents';

interface ThemeBarsPreviewProps {
    template: TemplateType;
    active?: boolean;
    className?: string;
    onClick?: () => void;
}

export default function ThemePreview({
    template,
    active = false,
    className,
    onClick,
}: ThemeBarsPreviewProps) {
    const { bars, backgroundColor, accentType, accentColor } = template;

    const [hovered, setHovered] = useState(false);
    const [heights, setHeights] = useState<number[]>([20, 40, 60, 30]);

    const shouldAnimate = hovered || active;

    useEffect(() => {
        if (!shouldAnimate) {
            setHeights([18, 28, 38, 24]);
            return;
        }

        const generate = () => Array.from({ length: 4 }, () => Math.random() * 55 + 25);

        setHeights(generate());

        const interval = setInterval(() => {
            setHeights(generate());
        }, 1500);

        return () => clearInterval(interval);
    }, [shouldAnimate]);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                'relative w-full aspect-video h-18 rounded-md overflow-hidden cursor-pointer',
                className,
            )}
        >
            <div
                style={{ backgroundColor }}
                className="absolute inset-0 z-0 rounded-md overflow-hidden pointer-events-none"
            >
                <CanvasAccents design={accentType} accentColor={accentColor} />
            </div>

            <div className="absolute inset-0 z-10 flex items-end justify-around px-2 pb-2.5 pt-6 gap-x-1.5">
                {heights.map((h, i) => (
                    <motion.div
                        key={i}
                        className="flex-1 rounded-tr-[3px]"
                        style={{ backgroundColor: bars[i % bars.length] }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                ))}
            </div>
        </div>
    );
}
