'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HeadingSectionComponentProps {
    title: string;
    description: string;
    textClassName?: string;
}

export default function HeadingSectionComponent({
    title,
    description,
    textClassName,
}: HeadingSectionComponentProps) {
    return (
        <section className="grid grid-cols-2 py-30 items-center">
            <motion.div className={cn('text-5xl max-w-xl mx-auto')}>{title}</motion.div>
            <motion.div
                className={cn(
                    'text-xl mx-auto max-w-xl text-light-base/70 tracking-wide flex justify-center items-center',
                    textClassName,
                )}
            >
                {description}
            </motion.div>
        </section>
    );
}
