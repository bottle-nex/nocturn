'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import '@theme-toggles/react/css/Classic.css';
import { Classic } from '@theme-toggles/react';

export default function DarkModeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const isDark = resolvedTheme === 'dark';

    return (
        <div className="flex items-center gap-2 px-3 py-2 dark:bg-neutral-600/30 bg-neutral-500/20 rounded-lg transition-all duration-200 transform hover:scale-105 !cursor-pointer">
            <Classic
                toggled={isDark}
                toggle={(next) => {
                    const newVal = typeof next === 'function' ? next(isDark) : next;
                    setTheme(newVal ? 'dark' : 'light');
                }}
                duration={750}
                className="text-xl "
                {...({} as React.ComponentProps<typeof Classic>)}
            />
        </div>
    );
}
