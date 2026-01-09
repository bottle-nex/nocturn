'use client';

import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

export default function DarkModeToggle() {
    return (
        <AnimatedThemeToggler
            className="flex items-center gap-2 px-3 py-2 bg-light-base dark:bg-dark-base rounded-none shadow-hard border dark:border-light-alpha border-dark-alpha cursor-pointer text-xl"
            duration={300}
        />
    );
}
