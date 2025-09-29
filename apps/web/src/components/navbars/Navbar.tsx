'use client';
import AppLogo from '../app/AppLogo';
import NavItems from './NavItems';
import DarkModeToggle from '../base/DarkModeToggle';
import NavbarSigninAction from './NavbarSigninAction';
import { useEffect, useState } from 'react';

const navItems = [
    { name: 'Features', link: '#features' },
    { name: 'Pricing', link: '#pricing' },
    { name: 'Contact', link: '#contact' },
];

export default function Navbar() {
    const [atTop, setAtTop] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);

    useEffect(() => {
        function handleScroll() {
            const currentScrollY = window.scrollY;

            if (currentScrollY === 0) {
                setAtTop(true);
                setIsVisible(true);
            } else {
                setAtTop(false);

                if (currentScrollY < lastScrollY) {
                    setIsVisible(true);
                } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false);
                }
            }

            setLastScrollY(currentScrollY);
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    return (
        <div
            className={`fixed left-1/2 -translate-x-1/2 px-4 py-4 z-[100] 
                transition-all duration-500 ease-in-out rounded-2xl
                ${atTop ? 'top-1 border-none' : 'top-4 border shadow-lg bg-gradient-to-b dark:from-[#1c1c1c] dark:via-neutral-900/90 dark:to-[#1c1c1c] backdrop-blur-sm from-neutral-200 via-neutral-100 to-neutral-200'}
                ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
            style={{
                maxWidth: atTop ? '100%' : '56rem',
                width: '100%',
                transition:
                    'max-width 0.6s ease, top 0.4s ease, transform 0.3s ease, opacity 0.3s ease',
            }}
        >
            <div className="px-4 flex items-center justify-between w-full">
                <AppLogo />
                <div className="flex">
                    <DarkModeToggle />
                    <NavItems items={navItems} isAtTop={atTop} />
                </div>
                <NavbarSigninAction />
            </div>
        </div>
    );
}
