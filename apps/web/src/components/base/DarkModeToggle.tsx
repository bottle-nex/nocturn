'use client';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function DarkModeToggle() {
    return (
        <AnimatedThemeToggler
            className="flex items-center py-2 rounded cursor-pointer text-xl"
            duration={0}
        />
    );
}
