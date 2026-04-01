'use client';
import { useEffect } from 'react';
import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';

const pathVariants: Variants = {
    normal: {
        translateX: 0,
    },
    animate: {
        translateX: [-6, 0],
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 13,
        },
    },
};

interface UsersProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const Users = ({
    width = 28,
    height = 28,
    strokeWidth = 2.5,
    stroke = '#FFA240',
    ...props
}: UsersProps) => {
    const controls = useAnimation();

    useEffect(() => {
        const interval = setInterval(async () => {
            await controls.start('animate');
            await controls.start('normal');
        }, 4500); // ⏱️ change timing here

        return () => clearInterval(interval);
    }, [controls]);

    return (
        <div className="p-2 flex items-center justify-center">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />

                <motion.path
                    d="M22 21v-2a4 4 0 0 0-3-3.87"
                    variants={pathVariants}
                    animate={controls}
                />

                <motion.path
                    d="M16 3.13a4 4 0 0 1 0 7.75"
                    variants={pathVariants}
                    animate={controls}
                />
            </svg>
        </div>
    );
};

export { Users };
