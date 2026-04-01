'use client';
import { useEffect } from 'react';
import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';

const mainLayerVariants: Variants = {
    normal: {
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
    animate: {
        y: 8,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
};

const mergingVariants: Variants = {
    normal: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
    animate: {
        y: -4,
        opacity: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
};

interface LayersProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const Layers = ({
    width = 28,
    height = 28,
    strokeWidth = 2.5,
    stroke = '#00827B',
    ...props
}: LayersProps) => {
    const controls = useAnimation();

    useEffect(() => {
        let isAnimating = false;

        const interval = setInterval(() => {
            controls.start(isAnimating ? 'normal' : 'animate');
            isAnimating = !isAnimating;
        }, 5200);

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
                {/* Top layer that moves down */}
                <motion.path
                    d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"
                    variants={mainLayerVariants}
                    animate={controls}
                />
                {/* Bottom layers that fade out */}
                <motion.path
                    d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"
                    variants={mergingVariants}
                    animate={controls}
                />
                <motion.path
                    d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"
                    variants={mergingVariants}
                    animate={controls}
                    custom={1}
                />
            </svg>
        </div>
    );
};

export { Layers };
