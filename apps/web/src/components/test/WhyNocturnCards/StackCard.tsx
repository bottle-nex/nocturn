'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function StackCard({
    children,
    index,
}: {
    children: React.ReactNode;
    index: number;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'start start'],
    });

    // depth compression
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

    // fade under next card
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);

    // realistic stacking shadow
    const shadow = useTransform(
        scrollYProgress,
        [0, 1],
        ['0px 10px 30px rgba(0,0,0,0.05)', '0px 40px 80px rgba(0,0,0,0.18)'],
    );

    return (
        <div
            ref={ref}
            className="sticky top-28 h-[70vh] flex items-center justify-center"
            style={{ zIndex: 50 - index }}
        >
            <motion.div
                style={{ scale, opacity, boxShadow: shadow }}
                className="w-full max-w-5xl rounded-4xl"
            >
                {children}
            </motion.div>
        </div>
    );
}
