import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface ExpandableCardProps {
    children: React.ReactNode;
    ref: React.RefObject<HTMLDivElement | null>;
    isExpanded: boolean;
    setIsExpanded: (open: boolean) => void;
}

export default function ExpandableCard({ children, ref, isExpanded }: ExpandableCardProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Don't render until mounted (prevents hydration issues)
    if (!mounted) return null;

    const cardContent = (
        <div
            ref={ref}
            className={cn(
                'p-0 z-50',
                'duration-300 ease-in-out transition-all',
                'border border-neutral-200 dark:border-neutral-700 bg-light-base dark:bg-neutral-900',
                'shadow-2xl',
                isExpanded
                    ? 'fixed top-0 right-0 w-[32vw] h-full rounded-l-xl'
                    : 'fixed bottom-22 right-15 w-[24rem] h-[38rem] rounded-xl',
            )}
        >
            {children}
        </div>
    );

    // Render through portal to document.body
    return createPortal(cardContent, document.body);
}
