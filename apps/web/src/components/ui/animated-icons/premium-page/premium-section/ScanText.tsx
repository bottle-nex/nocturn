'use client';
import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import { useCallback, useEffect } from 'react';

const frameVariants: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 1 },
};

const lineVariants: Variants = {
    visible: { pathLength: 1, opacity: 1 },
    hidden: { pathLength: 0, opacity: 0 },
};

interface ScanTextProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const ScanText = ({
    width = 28,
    height = 28,
    strokeWidth = 2.5,
    stroke = '#FF8C00',
    ...props
}: ScanTextProps) => {
    const controls = useAnimation();

    const handleHoverStart = useCallback(async () => {
        await controls.start((i) => ({
            pathLength: 0,
            opacity: 0,
            transition: { delay: i * 0.1, duration: 0.3 },
        }));
        await controls.start((i) => ({
            pathLength: 1,
            opacity: 1,
            transition: { delay: i * 0.1, duration: 0.3 },
        }));
    }, [controls]);

    useEffect(() => {
        const interval = setInterval(() => {
            handleHoverStart();
        }, 3200);

        return () => clearInterval(interval);
    }, [handleHoverStart]);

    return (
        <div
            style={{
                cursor: 'pointer',
                userSelect: 'none',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox="0 0 24 24"
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                {...props}
            >
                <motion.path variants={frameVariants} d="M3 7V5a2 2 0 0 1 2-2h2" />
                <motion.path variants={frameVariants} d="M17 3h2a2 2 0 0 1 2 2v2" />
                <motion.path variants={frameVariants} d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <motion.path variants={frameVariants} d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <motion.path
                    variants={lineVariants}
                    initial="visible"
                    animate={controls}
                    custom={0}
                    d="M7 8h8"
                />
                <motion.path
                    variants={lineVariants}
                    initial="visible"
                    animate={controls}
                    custom={1}
                    d="M7 12h10"
                />
                <motion.path
                    variants={lineVariants}
                    initial="visible"
                    animate={controls}
                    custom={2}
                    d="M7 16h6"
                />
            </svg>
        </div>
    );
};

export { ScanText };
