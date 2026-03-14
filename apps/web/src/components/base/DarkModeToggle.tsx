'use client';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { cn } from '@/lib/utils';

export default function DarkModeToggle({ className }: { className?: string }) {
    return (
        <AnimatedThemeToggler
            className={cn(
                'flex items-center justify-center rounded-base cursor-pointer text-xl',
                className,
            )}
            duration={600}
        />
    );
}
