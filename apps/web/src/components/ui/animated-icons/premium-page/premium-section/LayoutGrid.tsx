'use client';
import { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import type { Variants } from 'motion/react';

const boxVariants: Variants = {
    normal: () => ({
        x: 0,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    }),
    animate: (i: number) => {
        const positions = [
            { x: 11, y: 0 }, // Top left moves right
            { x: 0, y: 11 }, // Top right moves down
            { x: -11, y: 0 }, // Bottom right moves left
            { x: 0, y: -11 }, // Bottom left moves up
        ];
        return {
            ...positions[i],
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 25,
            },
        };
    },
};

interface LayoutGridProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const LayoutGrid = ({
    width = 28,
    height = 28,
    strokeWidth = 2.5,
    stroke = '#5A9CB5',
    ...props
}: LayoutGridProps) => {
    const controls = useAnimation();

    useEffect(() => {
        let isAnimating = false;

        const interval = setInterval(() => {
            controls.start(isAnimating ? 'normal' : 'animate');
            isAnimating = !isAnimating;
        }, 4200);

        return () => clearInterval(interval);
    }, [controls]);

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
                <motion.rect
                    width="7"
                    height="7"
                    x="3"
                    y="3"
                    rx="1"
                    variants={boxVariants}
                    animate={controls}
                    initial="normal"
                    custom={0}
                />
                <motion.rect
                    width="7"
                    height="7"
                    x="14"
                    y="3"
                    rx="1"
                    variants={boxVariants}
                    animate={controls}
                    initial="normal"
                    custom={1}
                />
                <motion.rect
                    width="7"
                    height="7"
                    x="14"
                    y="14"
                    rx="1"
                    variants={boxVariants}
                    animate={controls}
                    initial="normal"
                    custom={2}
                />
                <motion.rect
                    width="7"
                    height="7"
                    x="3"
                    y="14"
                    rx="1"
                    variants={boxVariants}
                    animate={controls}
                    initial="normal"
                    custom={3}
                />
            </svg>
        </div>
    );
};

export { LayoutGrid };
