'use client';
import { motion, useAnimation } from 'motion/react';
import { useEffect } from 'react';
import type { Variants } from 'motion/react';

interface AirplayProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const screenVariants: Variants = {
    normal: { opacity: 1 },
    animate: {
        opacity: [1, 0.5, 1],
        transition: {
            duration: 1,
            ease: 'easeInOut',
        },
    },
};

const triangleVariants: Variants = {
    normal: {
        y: 0,
        opacity: 1,
    },
    animate: {
        y: [-2, 0],
        opacity: [0.5, 1],
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

const Airplay = ({
    width = 28,
    height = 28,
    strokeWidth = 2.5,
    stroke = '#6367FF',
    ...props
}: AirplayProps) => {
    const controls = useAnimation();

    useEffect(() => {
        const interval = setInterval(() => {
            controls.start('animate').then(() => {
                controls.start('normal');
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [controls]);

    return (
        <div
            style={{
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
                <motion.path
                    d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"
                    variants={screenVariants}
                    animate={controls}
                    initial="normal"
                />
                <motion.path
                    d="m12 15 5 6H7Z"
                    variants={triangleVariants}
                    animate={controls}
                    initial="normal"
                />
            </svg>
        </div>
    );
};

export { Airplay };
