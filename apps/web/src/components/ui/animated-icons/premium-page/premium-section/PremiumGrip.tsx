'use client';

import { AnimatePresence, motion, useAnimation } from 'motion/react';
import { useEffect } from 'react';

const circles = [
    { cx: 19, cy: 5 },
    { cx: 12, cy: 5 },
    { cx: 19, cy: 12 },
    { cx: 5, cy: 5 },
    { cx: 12, cy: 12 },
    { cx: 19, cy: 19 },
    { cx: 5, cy: 12 },
    { cx: 12, cy: 19 },
    { cx: 5, cy: 19 },
];

interface GripProps extends React.SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
    strokeWidth?: number;
    stroke?: string;
}

const PremiumGrip = ({
    width = 28,
    height = 28,
    strokeWidth = 2.5,
    stroke = '#6FAF4F',
    ...props
}: GripProps) => {
    const controls = useAnimation();

    useEffect(() => {
        const runAnimation = async () => {
            await controls.start((i) => ({
                opacity: 0.3,
                transition: {
                    delay: i * 0.1,
                    duration: 0.2,
                },
            }));

            await controls.start((i) => ({
                opacity: 1,
                transition: {
                    delay: i * 0.1,
                    duration: 0.2,
                },
            }));
        };

        runAnimation();

        const interval = setInterval(() => {
            runAnimation();
        }, 5500);

        return () => clearInterval(interval);
    }, [controls]);

    return (
        <motion.div
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
                <AnimatePresence>
                    {circles.map((circle, index) => (
                        <motion.circle
                            key={`${circle.cx}-${circle.cy}`}
                            cx={circle.cx}
                            cy={circle.cy}
                            r="1"
                            initial={{ opacity: 1 }}
                            animate={controls}
                            custom={index}
                        />
                    ))}
                </AnimatePresence>
            </svg>
        </motion.div>
    );
};

export { PremiumGrip };
