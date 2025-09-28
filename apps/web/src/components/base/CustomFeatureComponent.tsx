'use client';
import { cn } from '@/lib/utils';
import { Boldonse } from 'next/font/google';
import Image from 'next/image';
import { AlarmClock } from '../ui/animated-icons/AlarmClock';
import ToolTipComponent from '../utility/TooltipComponent';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Iphone from '../magicui/Iphone';

const boldonse = Boldonse({
    weight: '400',
    subsets: ['latin'],
});

export default function CustomFeatureComponent() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { theme } = useTheme();

    const iphoneImage: string =
        theme === 'dark' ? '/images/iphone-image-dark.png' : '/images/iphone-image-light.png';

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsVisible(entry.isIntersecting);
                });
            },
            { threshold: 0.2 },
        );

        const element = ref.current;
        if (element) observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, []);

    return (
        <div ref={ref} className="w-full flex select-none h-full justify-center gap-x-10 mt-20">
            <div className="flex select-none p-2 rounded-3xl relative w-full">
                <div className="flex justify-center relative z-10 w-full max-w-[60rem] mx-auto">
                    <div
                        className={cn(
                            'w-full h-[70vh] border rounded-3xl flex justify-center items-center',
                            'bg-gradient-to-b from-neutral-50 via-neutral-100 to-neutral-50', // light mode
                            'dark:bg-gradient-to-b dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950', // dark mode
                            'relative shadow-2xl shadow-neutral-300/20 dark:shadow-neutral-800/20 drop-shadow-2xl',
                            'transition-all duration-800 ease-out',
                            isVisible
                                ? 'transform scale-100 opacity-100 translate-y-0'
                                : 'transform scale-75 opacity-0 translate-y-8',
                        )}
                    >
                        <div
                            className={cn(
                                'h-55 w-30 absolute -left-10 p-1 -top-5 flex flex-col gap-1 rounded-2xl border border-neutral-300 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950',
                                'transition-all duration-700 ease-out',
                                isVisible
                                    ? 'transform translate-x-0 opacity-100'
                                    : 'transform -translate-x-8 opacity-0',
                            )}
                        >
                            <div className="w-full h-full border rounded-2xl flex justify-center items-center flex-col bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-900">
                                <AlarmClock
                                    className="h-10 w-10 text-neutral-800 dark:text-neutral-200"
                                    color={theme === 'dark' ? '#e4e4e4' : '#1f2937'}
                                />
                            </div>
                            <div
                                className={cn(
                                    `w-full h-full border text-[25px] rounded-2xl flex flex-col justify-center items-center text-center bg-neutral-100 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-900`,
                                    `${boldonse.className} leading-10 tracking-wide`,
                                    'text-neutral-900 dark:text-[#e4e4e4]',
                                )}
                            >
                                WIN IN{' '}
                                <span className="text-yellow-600 dark:text-[#BA832A]">TIME</span>
                            </div>
                        </div>

                        <div
                            className={cn(
                                'h-auto w-auto absolute -top-7 right-6 p-1.5 flex flex-row gap-1.5 rounded-2xl border border-neutral-300 bg-neutral-50 dark:border-neutral-900 dark:bg-neutral-950',
                                'transition-all duration-700 ease-out',
                                isVisible
                                    ? 'transform translate-x-0 opacity-100'
                                    : 'transform translate-x-8 opacity-0',
                            )}
                        >
                            {[
                                'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg',
                                'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg',
                                'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg',
                                'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg',
                            ].map((src, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'w-10 h-10 border rounded-full flex justify-center items-center flex-col overflow-hidden bg-neutral-100 border-neutral-300 dark:bg-neutral-900 dark:border-neutral-900',
                                        'hover:scale-105 transition-transform duration-200',
                                        'transition-all duration-300 ease-out',
                                        isVisible
                                            ? 'transform scale-100 opacity-100'
                                            : 'transform scale-0 opacity-0',
                                    )}
                                >
                                    <Image src={src} alt="Avatar" width={100} height={100} unoptimized />
                                </div>
                            ))}
                            <ToolTipComponent content="Yupp! Scalability is not an issue">
                                <div
                                    className={cn(
                                        'w-10 h-10 border rounded-full flex justify-center items-center text-xs font-semibold tracking-wide text-center align-middle overflow-hidden bg-neutral-100 border-neutral-300 text-yellow-600 dark:bg-neutral-900 dark:border-neutral-900 dark:text-[#BA832A]',
                                        'hover:scale-105 transition-transform duration-200',
                                        'transition-all duration-300 ease-out',
                                        isVisible
                                            ? 'transform scale-100 opacity-100'
                                            : 'transform scale-0 opacity-0',
                                    )}
                                >
                                    +10K
                                </div>
                            </ToolTipComponent>
                        </div>

                        <div className="w-[240px] absolute -right-20 -bottom-8">
                            <Iphone tilted src={iphoneImage} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
