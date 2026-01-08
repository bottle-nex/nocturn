'use client';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useState } from 'react';

interface NavItemsProps {
    items: {
        name: string;
        link?: string;
        onClick?: () => void;
    }[];
    className?: string;
}

export default function NavItems({ items, className }: NavItemsProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <motion.div
            onMouseLeave={() => setHovered(null)}
            className={cn(
                'hidden flex-1 flex-row items-center justify-center space-x-2 text-xs font-semibold dark:text-light-prime transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2',
                className,
            )}
        >
            {items.map((item, idx) => (
                <a
                    onMouseEnter={() => setHovered(idx)}
                    onClick={item.onClick}
                    className={`relative text-neutral-600 dark:text-neutral-300 px-2 py-1 cursor-pointer`}
                    key={`link-${idx}`}
                    href={item.link}
                >
                    {hovered === idx && (
                        <motion.div
                            layoutId="hovered"
                            className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-700/50 py-1"
                        />
                    )}
                    <span className="relative z-20">{item.name}</span>
                </a>
            ))}
        </motion.div>
    );
}
