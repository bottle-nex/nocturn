'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TriangleTimerBarProps {
    startTime?: number | Date | string;
    endTime?: number | Date | string;
    className?: string;
    bg?: string;
}

export default function TriangleTimerBar({
    startTime,
    endTime,
    className,
    bg = '#1e1e1e',
}: TriangleTimerBarProps) {
    const [width, setWidth] = useState(0);

    const getTs = useCallback((t?: number | Date | string): number | null => {
        if (!t) return null;
        if (typeof t === 'number') return t;
        if (typeof t === 'string') return new Date(t).getTime();
        return t.getTime();
    }, []);

    const start = useMemo(() => getTs(startTime), [startTime, getTs]);
    const end = useMemo(() => getTs(endTime), [endTime, getTs]);
    const duration = useMemo(() => {
        if (!start || !end) return null;
        return Math.max(1, end - start);
    }, [start, end]);

    useEffect(() => {
        if (!start || !end || !duration) return; // nothing to animate

        let raf: number;

        const tick = () => {
            const now = Date.now();

            if (now <= start) {
                setWidth(0);
                raf = requestAnimationFrame(tick);
                return;
            }

            if (now >= end) {
                setWidth(1000);
                return;
            }

            const progress = ((now - start) / duration) * 1000;
            setWidth(progress);
            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [start, end, duration]);

    // If times are missing, don’t render the bar
    if (!start || !end) {
        return null;
    }

    return (
        <div
            className={cn(
                'w-full h-[100px] flex items-center justify-center z-[9999] text-dark-base',
                className,
            )}
        >
            <div className="w-[70%] relative">
                <svg viewBox="0 0 1000 140" width="100%" height="100%">
                    {/* Background Triangle */}
                    <path
                        d="M0 1.16702C0 0.553654 0.433192 0.0671652 1.03933 0.161072C18.4257 2.85467 250.06 38.7073 402.087 60.4916C633.537 93.6567 1000 140 1000 140H0.999987C0.447702 140 0 139.552 0 139V1.16702Z"
                        fill={`${bg}33`}
                    />

                    <clipPath id="triangle-clip">
                        <path d="M0 1.16702C0 0.553654 0.433192 0.0671652 1.03933 0.161072C18.4257 2.85467 250.06 38.7073 402.087 60.4916C633.537 93.6567 1000 140 1000 140H0.999987C0.447702 140 0 139.552 0 139V1.16702Z" />
                    </clipPath>

                    <g clipPath="url(#triangle-clip)">
                        <rect x="0" y="0" height="140" fill={bg} width={width} />
                    </g>
                </svg>

                <div className="absolute -bottom-5 left-0 text-sm font-semibold">1000 pts</div>
                <div className="absolute -bottom-5 right-0 text-sm font-semibold">100 pts</div>
            </div>
        </div>
    );
}
