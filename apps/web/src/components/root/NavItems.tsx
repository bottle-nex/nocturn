'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavItem {
    label: string;
    link: string;
    onClick?: () => void;
}

interface NavItemsProps {
    items: NavItem[];
    className?: string;
}

export default function NavItems({ items, className }: NavItemsProps) {
    const [hovered, setHovered] = useState<number | null>(null);
    const [active, setActive] = useState<number | null>(null);

    const handleClick = (idx: number, onClick?: () => void) => {
        onClick?.();
        setActive(idx);
    };

    return (
        <motion.div
            onMouseLeave={() => setHovered(null)}
            className={cn(
                'flex items-center gap-x-4 h-15 ',
                'px-2.5 rounded-full',
                'bg-black text-sm',
                className,
            )}
        >
            {items.map((item, idx) => {
                const isActive = active === idx;
                const isHovered = hovered === idx;

                return (
                    <a
                        key={`link-${idx}`}
                        href={item.link}
                        onMouseEnter={() => setHovered(idx)}
                        onClick={() => handleClick(idx, item.onClick)}
                        className={cn(
                            'relative px-6 py-3 rounded-full cursor-pointer select-none',
                            'text-gamma transition-colors',
                        )}
                    >
                        {(isHovered || isActive) && (
                            <motion.div
                                layoutId="nav-pill"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                className={cn(
                                    'absolute inset-0 rounded-full',
                                    'bg-alpha',
                                    'shadow-[inset_0_3px_2px_rgba(0,0,0,0.4)]',
                                )}
                            />
                        )}

                        <span className="relative z-10">{item.label}</span>
                    </a>
                );
            })}
        </motion.div>
    );
}
