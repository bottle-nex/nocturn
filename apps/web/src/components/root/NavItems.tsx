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
                'flex items-center justify-between gap-x-4 h-15 w-200',
                'px-2 rounded-[8px]',
                'bg-white text-tprime',
                className,
            )}
        >
            <div className={cn('px-4 text-base text-tprime font-semibold')}>Nocturn</div>

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
                                'text-tprime transition-colors text-base font-semibold',
                            )}
                        >
                            {(isHovered || isActive) && (
                                <motion.div
                                    layoutId="nav-pill"
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    className={cn('absolute inset-0 rounded-[6px]', 'bg-[#F5F1E4]')}
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
