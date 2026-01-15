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
            initial={{ scale: 0.98, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
            }}
            onMouseLeave={() => setHovered(null)}
            className={cn(
                'flex items-center justify-between gap-x-4 h-14 w-200',
                'px-2 rounded-full',
                'bg-nlighter text-nprime-darkest',
                'shadow-sm shadow-ndarker/10 ring-1 ring-ndarker/10',
                className,
            )}
        >
            <div className={cn('px-4 text-base text-ndarkest tracking-wide')}>Nocturn</div>

            <div>
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
                                'relative px-6 py-3.5 cursor-pointer select-none',
                                'text-[#3C315B] transition-colors text-base',
                            )}
                        >
                            {(isHovered || isActive) && (
                                <motion.div
                                    layoutId="nav-pill"
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    className={cn('absolute inset-0 rounded-full', 'bg-nlight')}
                                />
                            )}

                            <span className="relative z-10">{item.label}</span>
                        </a>
                    );
                })}
            </div>
        </motion.div>
    );
}
