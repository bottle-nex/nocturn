import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface OpacityBackgroundProps {
    children: React.ReactNode;
    className?: string;
    onBackgroundClick?: () => void;
    escapeClosing?: boolean;
}

export default function OpacityBackground({
    children,
    className,
    onBackgroundClick,
    escapeClosing = false,
}: OpacityBackgroundProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!escapeClosing) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape' && onBackgroundClick) {
                onBackgroundClick();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [escapeClosing, onBackgroundClick]);

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onBackgroundClick) {
            onBackgroundClick();
        }
    };

    const backgroundElement = (
        <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(1px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
                'fixed w-screen h-screen inset-0 backdrop-blur-[1px] flex items-center justify-center z-50',
                className,
            )}
            onClick={handleBackgroundClick}
        >
            {children}
        </motion.div>
    );

    if (!mounted) return null;
    return createPortal(backgroundElement, document.body);
}
