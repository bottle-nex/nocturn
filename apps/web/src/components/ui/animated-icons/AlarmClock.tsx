'use client';

import { motion, useAnimation } from 'motion/react';
import type { Variants } from 'motion/react';

interface AlarmClockProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const clockHandVariants: Variants = {
    normal: {
        rotate: 0,
        originX: '50%',
        originY: '50%',
    },
    animate: {
        rotate: 360,
        transition: {
            duration: 2,
            ease: 'linear',
            repeat: Infinity,
        },
    },
};

const bellVariants: Variants = {
    normal: { rotate: 0 },
    animate: {
        rotate: [-10, 10, -10],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
        },
    },
};

const AlarmClock = ({
    width = 28,
    height = 28,
    strokeWidth = 2,
    stroke = 'currentColor',
    ...props
}: AlarmClockProps) => {
    const controls = useAnimation();

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
            onMouseEnter={() => controls.start('animate')}
            onMouseLeave={() => controls.start('normal')}
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
                <circle cx="12" cy="13" r="8" />
                <motion.path
                    d="M12 9v4l2 2"
                    variants={clockHandVariants}
                    animate={controls}
                    initial="normal"
                />
                <motion.g variants={bellVariants} animate={controls} initial="normal">
                    <path d="M5 3 2 6" />
                    <path d="m22 6-3-3" />
                    <path d="M6.38 18.7 4 21" />
                    <path d="M17.64 18.67 20 21" />
                </motion.g>
            </svg>
        </div>
    );
};

export { AlarmClock };
