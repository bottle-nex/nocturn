'use client';
import { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import type { Variants } from 'motion/react';

interface ChartColumnProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const frameVariants: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 1 },
};

const lineVariants: Variants = {
    visible: { pathLength: 1, opacity: 1 },
    hidden: { pathLength: 0, opacity: 0 },
};

const ChartColumn = ({
    width = 28,
    height = 28,
    strokeWidth = 2.5,
    stroke = '#FF3200',
    ...props
}: ChartColumnProps) => {
    const controls = useAnimation();

    const runAnimation = async () => {
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
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const loop = async () => {
            const randomDelay = Math.random() * 5000 + 2000;

            timeout = setTimeout(async () => {
                await runAnimation();
                loop(); // repeat again with new random delay
            }, randomDelay);
        };

        loop();

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleHoverStart = async () => {
        await runAnimation();
    };

    const handleHoverEnd = () => {
        controls.start('visible');
    };

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
            onMouseEnter={handleHoverStart}
            onMouseLeave={handleHoverEnd}
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
                    variants={lineVariants}
                    initial="visible"
                    animate={controls}
                    custom={1}
                    d="M13 17V9"
                />
                <motion.path
                    variants={lineVariants}
                    initial="visible"
                    animate={controls}
                    custom={2}
                    d="M18 17V5"
                />
                <motion.path variants={frameVariants} d="M3 3v16a2 2 0 0 0 2 2h16" />
                <motion.path
                    variants={lineVariants}
                    initial="visible"
                    animate={controls}
                    custom={0}
                    d="M8 17v-3"
                />
            </svg>
        </div>
    );
};

export { ChartColumn };
