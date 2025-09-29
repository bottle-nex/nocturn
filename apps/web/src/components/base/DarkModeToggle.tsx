'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { IoMdMoon } from 'react-icons/io';
import { CiLight } from 'react-icons/ci';
import ToolTipComponent from '../utility/TooltipComponent';

export default function DarkModeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ToolTipComponent content="Toggle between light and dark mode">
            <div className="">
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-2 dark:bg-neutral-600/30 bg-neutral-500/20 rounded-lg transition-all duration-200 transform hover:scale-105 !cursor-pointer"
                >
                    {theme === 'dark' ? (
                        <CiLight className="text-xl" />
                    ) : (
                        <IoMdMoon className="text-lg" />
                    )}
                </button>
            </div>
        </ToolTipComponent>
    );
}
