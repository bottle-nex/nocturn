'use client';
import { JSX } from 'react';
import { motion, Variants } from 'framer-motion';
import UnclickableTicker from '../tickers/UnClickableTicker';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
    title?: string;
    description?: string;
    ticker?: string;
    icon?: JSX.Element;
    className?: string;
}

const container: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.96,
        filter: 'blur(8px)',
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            staggerChildren: 0.12,
        },
    },
};

const child: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function SectionHeading({
    title,
    description,
    ticker,
    icon,
    className,
}: SectionHeadingProps): JSX.Element {
    return (
        <motion.section
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className={cn('w-full flex flex-col items-center gap-y-2 max-w-270', className)}
        >
            <motion.div variants={child}>
                <UnclickableTicker>
                    {icon && <span>{icon}</span>}
                    <span>{ticker}</span>
                </UnclickableTicker>
            </motion.div>

            <motion.h1
                variants={child}
                className="text-7xl font-semibold text-dark-base text-center mt-4"
            >
                {title}
            </motion.h1>

            <motion.p variants={child} className="text-[19px] text-dark-base/80 text-center mt-2">
                {description}
            </motion.p>
        </motion.section>
    );
}
