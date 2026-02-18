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
    showText?: boolean;
}

export default function ThemePreview({
    template,
    active = false,
    className,
    onClick,
    showText,
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
                'relative w-full aspect-16/11 rounded-md overflow-hidden cursor-pointer',
                className,
            )}
        >
            {!showText && (
                <div
                    style={{
                        color: template.textColor,
                    }}
                    className="absolute top-1 left-1/2 -translate-x-1/2 z-20 text-[11px] font-medium capitalize"
                >
                    {template.name}
                </div>
            )}
            <div
                style={{ backgroundColor }}
                className="absolute inset-0 z-0 rounded-md overflow-hidden pointer-events-none"
            >
                <CanvasAccents design={accentType} accentColor={accentColor} />
            </div>

            <div className="absolute inset-0 z-10 flex items-end justify-around px-2 pb-2 pt-1">
                {heights.map((h, i) => (
                    <motion.div
                        key={i}
                        className="flex-1"
                        style={{ backgroundColor: bars[i % bars.length] }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                ))}
            </div>
        </div>
    );
}
