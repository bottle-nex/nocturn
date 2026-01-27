'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';

interface FoldersProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const folderVariants: Variants = {
    normal: {
        x: 0,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
    animate: {
        x: -4,
        y: 2,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
};

const bottomLineVariants: Variants = {
    normal: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
        },
    },
    animate: {
        opacity: 0,
        x: 4,
        y: -2,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
            opacity: { duration: 0.1 },
        },
    },
};

export default function AnimatedFolderIcon({
    width = 28,
    height = 28,
    strokeWidth = 2,
    stroke = '#ffffff',
    ...props
}: FoldersProps) {
    const controls = useAnimation();

    return (
        <div
            style={{
                cursor: 'pointer',
                userSelect: 'none',
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
                {/* Main folder */}
                <motion.path
                    d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.69-.9l-.81-1.2a2 2 0 0 0-1.67-.9H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"
                    variants={folderVariants}
                    animate={controls}
                />
                {/* Bottom line that fades away */}
                <motion.path
                    d="M2 8v11a2 2 0 0 0 2 2h14"
                    variants={bottomLineVariants}
                    animate={controls}
                />
            </svg>
        </div>
    );
}
