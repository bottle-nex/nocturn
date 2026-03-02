'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface TimerBarProps {
    startTime?: number | Date | string;
    endTime?: number | Date | string;
    className?: string;
}

export default function TopTimerBarCompoment({ startTime, endTime, className }: TimerBarProps) {
    const [pct, setPct] = useState(100);

    const getTs = useCallback((t?: number | Date | string): number | null => {
        if (!t) return null;
        if (typeof t === 'number') return t;
        if (typeof t === 'string') return new Date(t).getTime();
        return t.getTime();
    }, []);

    const start = useMemo(() => getTs(startTime), [startTime, getTs]);
    const end = useMemo(() => getTs(endTime), [endTime, getTs]);
    const duration = useMemo(
        () => (!start || !end ? null : Math.max(1, end - start)),
        [start, end],
    );

    useEffect(() => {
        if (!start || !end || !duration) return;
        let raf: number;
        const tick = () => {
            const now = Date.now();
            if (now <= start) {
                setPct(100);
                raf = requestAnimationFrame(tick);
                return;
            }
            if (now >= end) {
                setPct(0);
                return;
            }
            setPct(((end - now) / duration) * 100);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [start, end, duration]);

    if (!start || !end) return null;

    return (
        <div
            className={cn(
                'absolute bottom-0 left-0 w-full h-4 bg-blue-200 overflow-hidden',
                className,
            )}
        >
            <div className="h-full bg-blue-500 transition-none" style={{ width: `${pct}%` }} />
        </div>
    );
}
