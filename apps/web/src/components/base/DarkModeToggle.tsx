'use client';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function DarkModeToggle() {
    return (
        <AnimatedThemeToggler
            className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-xl"
            duration={0}
        />
    );
}
