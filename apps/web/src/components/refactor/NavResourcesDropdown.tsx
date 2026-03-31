'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { RiCoinsFill, RiTeamFill, RiFileCodeFill, RiSparklingFill } from 'react-icons/ri';
import type { IconType } from 'react-icons';

interface ResourceItem {
    icon: IconType;
    title: string;
    description: string;
    color: string;
    bgColor: string;
    href: string;
}

const resourceItems: ResourceItem[] = [
    {
        icon: RiCoinsFill,
        title: 'USDC Integration',
        description: 'Prize pools and payouts on Solana.',
        color: '#4f46e5',
        bgColor: '#eef2ff',
        href: '/resources/usdc-integration',
    },
    {
        icon: RiTeamFill,
        title: 'Collaboration',
        description: 'Build quizzes together in real-time.',
        color: '#0d9488',
        bgColor: '#f0fdfa',
        href: '',
    },
    {
        icon: RiFileCodeFill,
        title: 'Smart Contract',
        description: 'On-chain escrow and settlements.',
        color: '#b45309',
        bgColor: '#fffbeb',
        href: '',
    },
    {
        icon: RiSparklingFill,
        title: 'AI Generation',
        description: 'Generate quizzes with AI in seconds.',
        color: '#7c3aed',
        bgColor: '#f5f3ff',
        href: '',
    },
];

interface NavResourcesDropdownProps {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export default function NavResourcesDropdown({
    onMouseEnter,
    onMouseLeave,
}: NavResourcesDropdownProps) {
    const router = useRouter();
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [bgStyle, setBgStyle] = useState({ top: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleItemMouseEnter = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
        setHoveredIdx(idx);
        const container = containerRef.current;
        const item = e.currentTarget;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        setBgStyle({
            top: itemRect.top - containerRect.top,
            height: itemRect.height,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="absolute top-full right-0 mt-3 z-50"
        >
            <div
                className="relative w-75 bg-white rounded-2xl py-2.5 px-1.5 overflow-hidden"
                style={{
                    boxShadow: '0 4px 32px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
                }}
            >
                <div
                    ref={containerRef}
                    className="relative"
                    onMouseLeave={() => setHoveredIdx(null)}
                >
                    <AnimatePresence>
                        {hoveredIdx !== null && (
                            <motion.div
                                key="dropdown-hover-bg"
                                className="absolute left-0 w-full bg-light-base rounded-xl pointer-events-none"
                                initial={{
                                    top: bgStyle.top,
                                    height: bgStyle.height,
                                    opacity: 0,
                                    scale: 0.95,
                                }}
                                animate={{
                                    top: bgStyle.top,
                                    height: bgStyle.height,
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        )}
                    </AnimatePresence>

                    {resourceItems.map((item, idx) => {
                        const Icon = item.icon;
                        const isHovered = hoveredIdx === idx;

                        return (
                            <div
                                key={idx}
                                onMouseEnter={(e) => handleItemMouseEnter(e, idx)}
                                onClick={() => {
                                    if (item.href) router.push(item.href);
                                }}
                                className="relative flex items-start gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer z-10"
                            >
                                <div
                                    className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center mt-0.5 transition-all duration-200"
                                    style={{
                                        backgroundColor: isHovered ? item.bgColor : '#f5f5f5',
                                        color: isHovered ? item.color : '#9ca3af',
                                    }}
                                >
                                    <Icon size={18} />
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-[14px] font-semibold text-dark-base/90 tracking-[-0.01em] leading-tight">
                                        {item.title}
                                    </span>
                                    <span className="text-[12.5px] text-dark-base/45 leading-snug">
                                        {item.description}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
