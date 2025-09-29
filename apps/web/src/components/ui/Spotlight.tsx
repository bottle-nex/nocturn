'use client';
import React from 'react';
import { motion } from 'motion/react';

type SpotlightProps = {
    translateY?: number;
    width?: number;
    height?: number;
    smallWidth?: number;
    duration?: number;
    xOffset?: number;
};

export const Spotlight = ({
    translateY = -350,
    width = 560,
    height = 1380,
    smallWidth = 240,
    duration = 7,
    xOffset = 100,
}: SpotlightProps = {}) => {
    // Dark mode gradients
    const darkGradients = {
        gradientFirst:
            'radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 85%, 0.08) 0%, hsla(210, 100%, 55%, 0.02) 50%, hsla(210, 100%, 45%, 0) 80%)',
        gradientSecond:
            'radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, 0.06) 0%, hsla(210, 100%, 55%, 0.02) 80%, transparent 100%)',
        gradientThird:
            'radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 85%, 0.04) 0%, hsla(210, 100%, 45%, 0.02) 80%, transparent 100%)',
    };

    // Light mode gradients
    const lightGradients = {
        gradientFirst:
            'radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(210, 100%, 40%, 0.2) 0%, hsla(210, 100%, 35%, 0.1) 50%, hsla(210, 100%, 30%, 0) 80%)',
        gradientSecond:
            'radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 45%, 0.15) 0%, hsla(210, 100%, 35%, 0.1) 80%, transparent 100%)',
        gradientThird:
            'radial-gradient(50% 50% at 50% 50%, hsla(210, 100%, 45%, 0.1) 0%, hsla(210, 100%, 35%, 0.05) 80%, transparent 100%)',
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
        >
            {/* Left Spotlight */}
            <motion.div
                animate={{ x: [0, xOffset, 0] }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
                className="absolute top-0 left-0 h-full pointer-events-none"
                style={{ width: '50%' }}
            >
                {/* Gradient layers */}
                <div
                    className="absolute top-0 left-0 dark:block hidden"
                    style={{
                        transform: `translateY(${translateY}px) rotate(-45deg)`,
                        background: darkGradients.gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 left-0 origin-top-left dark:block hidden"
                    style={{
                        transform: 'rotate(-45deg) translate(5%, -50%)',
                        background: darkGradients.gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 left-0 origin-top-left dark:block hidden"
                    style={{
                        transform: 'rotate(-45deg) translate(-180%, -70%)',
                        background: darkGradients.gradientThird,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />

                {/* Light mode gradients */}
                <div
                    className="absolute top-0 left-0 dark:hidden"
                    style={{
                        transform: `translateY(${translateY}px) rotate(-45deg)`,
                        background: lightGradients.gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 left-0 origin-top-left dark:hidden"
                    style={{
                        transform: 'rotate(-45deg) translate(5%, -50%)',
                        background: lightGradients.gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 left-0 origin-top-left dark:hidden"
                    style={{
                        transform: 'rotate(-45deg) translate(-180%, -70%)',
                        background: lightGradients.gradientThird,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />
            </motion.div>

            {/* Right Spotlight */}
            <motion.div
                animate={{ x: [0, -xOffset, 0] }}
                transition={{
                    duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                }}
                className="absolute top-0 right-0 h-full pointer-events-none"
                style={{ width: '50%' }}
            >
                {/* Dark mode */}
                <div
                    className="absolute top-0 right-0 dark:block hidden"
                    style={{
                        transform: `translateY(${translateY}px) rotate(45deg)`,
                        background: darkGradients.gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 right-0 origin-top-right dark:block hidden"
                    style={{
                        transform: 'rotate(45deg) translate(-5%, -50%)',
                        background: darkGradients.gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 right-0 origin-top-right dark:block hidden"
                    style={{
                        transform: 'rotate(45deg) translate(180%, -70%)',
                        background: darkGradients.gradientThird,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />

                {/* Light mode */}
                <div
                    className="absolute top-0 right-0 dark:hidden"
                    style={{
                        transform: `translateY(${translateY}px) rotate(45deg)`,
                        background: lightGradients.gradientFirst,
                        width: `${width}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 right-0 origin-top-right dark:hidden"
                    style={{
                        transform: 'rotate(45deg) translate(-5%, -50%)',
                        background: lightGradients.gradientSecond,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />
                <div
                    className="absolute top-0 right-0 origin-top-right dark:hidden"
                    style={{
                        transform: 'rotate(45deg) translate(180%, -70%)',
                        background: lightGradients.gradientThird,
                        width: `${smallWidth}px`,
                        height: `${height}px`,
                    }}
                />
            </motion.div>
        </motion.div>
    );
};
