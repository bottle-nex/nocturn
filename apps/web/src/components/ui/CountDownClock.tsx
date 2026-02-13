import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import useLiveTemplate from '@/hooks/useLiveTemplate';

interface CountDownClockProps {
    startTime: number | Date | string;
    endTime: number | Date | string;
    seconds?: number;
    reverse?: never;
}

export default function CountDownClock(props: CountDownClockProps) {
    const [currentTime, setCurrentTime] = useState(Date.now());
    const isSmartMode = props.startTime && props.endTime;
    const template = useLiveTemplate();
    const getTimestamp = useCallback((time: number | Date | string) => {
        if (typeof time === 'number') return time;
        if (typeof time === 'string') return new Date(time).getTime();
        return time.getTime();
    }, []);

    const startTimestamp = useMemo(() => {
        return isSmartMode ? getTimestamp(props.startTime!) : 0;
    }, [isSmartMode, props.startTime, getTimestamp]);

    const endTimestamp = useMemo(() => {
        return isSmartMode ? getTimestamp(props.endTime!) : 0;
    }, [isSmartMode, props.endTime, getTimestamp]);

    const calculateSmartTime = useCallback(() => {
        if (!isSmartMode) return 0;

        if (currentTime < startTimestamp) {
            return Math.floor((endTimestamp - startTimestamp) / 1000);
        }

        return Math.max(0, Math.floor((endTimestamp - currentTime) / 1000));
    }, [isSmartMode, currentTime, startTimestamp, endTimestamp]);

    const getInitialTime = () => {
        if (isSmartMode) {
            return calculateSmartTime();
        }
        return props.reverse ? 0 : props.seconds!;
    };

    const [time, setTime] = useState(getInitialTime);

    useEffect(() => {
        if (isSmartMode) {
            const interval = setInterval(() => {
                setCurrentTime(Date.now());
            }, 100);
            return () => clearInterval(interval);
        } else {
            const interval = setInterval(() => {
                setTime((prev) => {
                    if (props.reverse) {
                        return prev + 1;
                    } else {
                        return prev > 0 ? prev - 1 : 0;
                    }
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isSmartMode, props.reverse]);

    useEffect(() => {
        if (isSmartMode) {
            setTime(calculateSmartTime());
        }
    }, [currentTime, isSmartMode, calculateSmartTime]);

    const minutes = Math.floor(time / 60);
    const secs = time % 60;
    const format = (num: number) => (num < 10 ? `0${num}` : num);

    const isPaused =
        isSmartMode &&
        (() => {
            const getTimestamp = (time: number | Date | string) => {
                if (typeof time === 'number') return time;
                if (typeof time === 'string') return new Date(time).getTime();
                return time.getTime();
            };
            return currentTime < getTimestamp(props.startTime!);
        })();

    return (
        <div
            style={{ color: template?.textColor }}
            className={cn(
                'flex items-center space-x-2 text-4xl font-bold text-white rounded-xl px-4 py-3',
                // 'bg-light-base dark:bg-dark-alpha dark:text-light-base text-dark-alpha',
            )}
        >
            {/* Minutes */}
            <div className="relative w-full overflow-hidden flex flex-col items-center justify-center">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={minutes}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {format(minutes)}
                    </motion.span>
                </AnimatePresence>
                <div className="text-sm font-semibold">Minutes</div>
            </div>
            <span className="text-4xl font-mono">:</span>
            {/* Seconds */}
            <div className="relative w-full overflow-hidden flex flex-col items-center justify-center">
                <AnimatePresence mode="popLayout">
                    <motion.span
                        key={secs}
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {format(secs)}
                    </motion.span>
                </AnimatePresence>
                <div className="text-sm font-semibold">Seconds</div>
            </div>
            {isPaused && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
                    Starting soon...
                </div>
            )}
        </div>
    );
}
