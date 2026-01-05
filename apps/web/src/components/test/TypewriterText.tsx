'use client';
import { motion } from 'motion/react';

interface TypewriterTextProps {
    text: string;
    className?: string;
}

export default function TypewriterText({ text, className = '' }: TypewriterTextProps) {
    return (
        <motion.h1
            className={className}
            initial={{
                opacity: 0,
                y: 30,
                rotateX: 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotateX: 0,
            }}
            transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{
                transformPerspective: 1000,
                transformOrigin: 'bottom center',
            }}
        >
            {text}
        </motion.h1>
    );
}
