'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';
import { Divider } from './ProfileSettingsComponent';
import SettingsHeaderComponent from './SettingsUtility/SettingsHeaderComponent';

type Theme = 'system' | 'light' | 'dark';

const DURATION = 400;

function applyTheme(theme: Theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
    localStorage.setItem('theme', theme);
}

export default function ThemeSettingsComponent() {
    const [activeTheme, setActiveTheme] = useState<Theme>('system');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const stored = localStorage.getItem('theme') as Theme | null;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            setActiveTheme(stored);
        } else {
            setActiveTheme('system');
        }
    }, []);

    const selectTheme = useCallback(
        async (theme: Theme) => {
            if (theme === activeTheme) return;

            const isDark =
                theme === 'dark' ||
                (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (!document.startViewTransition) {
                flushSync(() => {
                    setActiveTheme(theme);
                    applyTheme(theme);
                });
                return;
            }

            await document.startViewTransition(() => {
                flushSync(() => {
                    setActiveTheme(theme);
                    applyTheme(theme);
                });
            }).ready;

            document.documentElement.animate(
                {
                    clipPath: isDark
                        ? [
                              'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                              'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                          ]
                        : [
                              'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
                              'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                          ],
                },
                {
                    duration: DURATION,
                    easing: 'cubic-bezier(0.95, 0.05, 0.2, 1)',
                    pseudoElement: '::view-transition-new(root)',
                },
            );
        },
        [activeTheme],
    );

    const themes: { key: Theme; label: string; src: string }[] = [
        { key: 'system', label: 'System default', src: '/images/home/theme/theme-system.svg' },
        { key: 'light', label: 'Light', src: '/images/home/theme/theme-light.svg' },
        { key: 'dark', label: 'Dark', src: '/images/home/theme/theme-dark.svg' },
    ];

    return (
        <div
            ref={containerRef}
            className="w-full mx-auto py-6 flex flex-col gap-6 rounded-xl mt-1 custom-scrollbar ring-1 ring-black/10 dark:ring-light-base/10 bg-light-base dark:bg-[#0F0F0F]"
        >
            <SettingsHeaderComponent
                title="Theme Settings"
                description="This only applies to your logged in dashboard"
            />

            <Divider />

            <div className="w-full flex justify-around items-center py-5 px-2">
                {themes.map(({ key, label, src }) => (
                    <button
                        key={key}
                        onClick={() => selectTheme(key)}
                        className="flex flex-col gap-y-2 items-center group bg-transparent border-none p-0 cursor-pointer"
                    >
                        <Image
                            src={src}
                            alt={label}
                            width={0}
                            height={0}
                            sizes="100vw"
                            className={cn(
                                'w-auto h-auto max-w-full rounded-xl transition-all duration-200 shadow-xs shadow-black/5',
                                activeTheme === key
                                    ? 'ring-2 ring-alpha'
                                    : 'hover:ring-1 hover:ring-alpha',
                            )}
                        />
                        <span
                            className={cn(
                                'text-[13px] transition-colors duration-200',
                                activeTheme === key
                                    ? 'text-alpha font-medium'
                                    : 'text-dark-base/60 dark:text-white/50 group-hover:text-dark-base dark:group-hover:text-white',
                            )}
                        >
                            {label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
