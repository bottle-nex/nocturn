import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { cn } from '@/lib/utils';
import { IoMoonSharp, IoSunny } from 'react-icons/io5';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
    duration?: number;
}

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    ...props
}: AnimatedThemeTogglerProps) => {
    const [isDark, setIsDark] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current) return;

        const newTheme = !isDark;

        await document.startViewTransition(() => {
            flushSync(() => {
                setIsDark(newTheme);
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', newTheme ? 'dark' : 'light');
            });
        }).ready;

        document.documentElement.animate(
            {
                clipPath: newTheme
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
                duration,
                easing: 'cubic-bezier(0.95, 0.05, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)',
            },
        );
    }, [isDark, duration]);

    return (
        <button ref={buttonRef} onClick={toggleTheme} className={cn(className)} {...props}>
            {isDark ? (
                <IoSunny className="text-black dark:text-white" size={18} />
            ) : (
                <IoMoonSharp className="text-black dark:text-white" size={18} />
            )}
            <span className="sr-only">Toggle theme</span>
        </button>
    );
};
