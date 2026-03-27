'use client';
import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface PerspectiveCardProps {
    children?: ReactNode;
    className?: string;
    shadowColor?: string;
    sticky?: boolean;
    stickyTop?: number;
}

export default function PerspectiveCard({
    children,
    className = '',
    shadowColor = '79,70,229',
    sticky = true,
    stickyTop = 10,
}: PerspectiveCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'start start'],
    });

    const y = useTransform(scrollYProgress, [0, 0.4, 0.6], [80, 10, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.4, 0.6], [1.04, 1.02, 1]);
    const boxShadow = useTransform(
        scrollYProgress,
        [0, 0.4, 0.6],
        [
            `0 25px 60px rgba(${shadowColor},0.35), 0 10px 20px rgba(0,0,0,0.2)`,
            `0 8px 24px rgba(${shadowColor},0.2), 0 4px 8px rgba(0,0,0,0.1)`,
            `0 0px 0px rgba(${shadowColor},0), 0 0px 0px rgba(0,0,0,0)`,
        ],
    );
    const opacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0.5, 1, 1]);

    const wrapper = (
        <motion.div ref={ref} style={{ y, scale, boxShadow, opacity }} className={className}>
            {children}
        </motion.div>
    );

    if (!sticky) return wrapper;

    return (
        <div className="sticky h-full w-full" style={{ top: stickyTop }}>
            {wrapper}
        </div>
    );
}
