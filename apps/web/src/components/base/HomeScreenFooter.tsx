'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '../app/AppLogo';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub } from 'react-icons/fa';
import { cn } from '@/lib/utils';

type FooterSection = {
    title: string;
    items: { label: string; href: string }[];
    delay: string;
};

const footerSections: FooterSection[] = [
    {
        title: 'Try Nocturn',
        items: [
            { label: 'Overview', href: '/overview' },
            { label: 'Features', href: '/features' },
            { label: 'Quiz', href: '/quiz' },
            { label: 'Live polling', href: '/live-polling' },
        ],
        delay: '100ms',
    },
    {
        title: 'Company',
        items: [
            { label: 'Company', href: '/company' },
            { label: 'Founders', href: '/founders' },
            { label: 'Contact', href: '/contact' },
        ],
        delay: '200ms',
    },
    {
        title: 'Details',
        items: [
            { label: 'Documentation', href: '/docs' },
            { label: 'Privacy policy', href: '/privacy' },
            { label: 'Contributors', href: '/contributors' },
            { label: 'Security', href: '/security' },
            { label: 'Safety', href: '/safety' },
            { label: 'Legal', href: '/legal' },
        ],
        delay: '300ms',
    },
];

export default function HomeScreenFooter() {
    const [isVisible, setIsVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const footerElement = document.getElementById('animated-footer');
        if (!footerElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry) {
                    setIsVisible(entry.isIntersecting);
                }
            },
            { threshold: 0.1, rootMargin: '50px 0px -50px 0px' },
        );

        observer.observe(footerElement);
        return () => observer.unobserve(footerElement);
    }, []);

    return (
        <footer
            id="animated-footer"
            className="relative w-full min-h-5xl pb-50 dark:text-white text-neutral-950 overflow-hidden select-none"
        >
            <div
                className={cn(
                    'absolute inset-0 transition-all duration-[1500ms] ease-out dark:block hidden',
                    isVisible ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                    background: `
                            radial-gradient(ellipse at center bottom, 
                            rgba(120, 80, 200, 0.3) 0%, 
                            rgba(100, 70, 180, 0.25) 15%, 
                            rgba(80, 60, 160, 0.2) 25%, 
                            rgba(60, 50, 140, 0.15) 35%, 
                            rgba(40, 40, 120, 0.12) 45%, 
                            rgba(30, 30, 100, 0.1) 55%, 
                            #0A0A0A 65%, 
                            #0A0A0A 100%
                        )
                    `,
                }}
            />
            <div
                className={cn(
                    'absolute inset-0 transition-all duration-[1500ms] ease-out dark:hidden block',
                    isVisible ? 'opacity-100' : 'opacity-0',
                )}
                style={{
                    background: `
                                radial-gradient(ellipse at center bottom, 
                                    rgba(120, 80, 200, 0.15) 0%, 
                                    rgba(100, 70, 180, 0.12) 15%, 
                                    rgba(80, 60, 160, 0.1) 25%, 
                                    rgba(60, 50, 140, 0.08) 35%, 
                                    rgba(40, 40, 120, 0.06) 45%, 
                                    rgba(30, 30, 100, 0.04) 55%, 
                                    #f5f5f5 65%, 
                                    #f5f5f5
                                )
                            `,
                }}
            />
            <div
                className={cn(
                    'relative z-10 max-w-7xl mx-auto px-8',
                    'transition-all duration-[1200ms] ease-out delay-200',
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                )}
            >
                <div className="grid grid-cols-4 gap-40">
                    <div
                        className={cn(
                            'flex-col items-start transition-all duration-1000 ease-out',
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
                        )}
                        style={{ transitionDelay: '600ms' }}
                    >
                        <AppLogo />
                        <div className="w-full flex gap-x-2 px-2.5 pt-4">
                            {[FaXTwitter, FaGithub].map((Icon, idx) => (
                                <span
                                    key={idx}
                                    className={cn(
                                        'h-10 w-10 rounded-full border p-2 flex justify-center items-center',
                                        'dark:bg-neutral-900/70 bg-white/80 dark:hover:bg-neutral-800/80 hover:bg-gray-50/90',
                                        'dark:border-neutral-700 border-gray-200',
                                        'transition-all duration-700 ease-out hover:scale-110',
                                        'dark:text-white text-gray-700',
                                        'shadow-sm dark:shadow-none',
                                        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
                                    )}
                                    style={{
                                        transitionDelay: `${800 + idx * 100}ms`,
                                    }}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </span>
                            ))}
                        </div>
                    </div>

                    {footerSections.map((section) => (
                        <div
                            key={section.title}
                            className={cn(
                                'space-y-6 transition-all duration-1000 ease-out',
                                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
                            )}
                            style={{ transitionDelay: section.delay }}
                        >
                            <h4 className="uppercase text-[13px] tracking-[0.15em] text-gray-400 font-medium">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.items.map((item, itemIndex) => (
                                    <li
                                        key={item.label}
                                        className={cn(
                                            'transition-all duration-700 ease-out cursor-pointer',
                                            isVisible
                                                ? 'opacity-100 translate-x-0'
                                                : 'opacity-0 translate-x-2',
                                        )}
                                        style={{
                                            transitionDelay: `${
                                                parseInt(section.delay) + itemIndex * 100
                                            }ms`,
                                        }}
                                        onClick={() => router.push(item.href)}
                                    >
                                        <span className="dark:text-gray-200 text-gray-700 dark:hover:text-[#9573E1] hover:text-[#9573E1] transition-colors duration-300 text-sm">
                                            {item.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </footer>
    );
}
