'use client';
import NavItems from './NavItems';
import DarkModeToggle from '../base/DarkModeToggle';
import NavbarSigninAction from './NavbarSigninAction';
import { useEffect, useState } from 'react';
import NocturnLogo from '../ui/svg/NocturnLogo';

const navItems = [
    { name: 'Features', link: '#features' },
    { name: 'Contact', link: '#contact' },
    { name: 'Faq', link: '#faq' },
];

export default function Navbar() {
    const [isVisible, setIsVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);

    useEffect(() => {
        function handleScroll() {
            const currentScrollY = window.scrollY;

            if (currentScrollY === 0) {
                setIsVisible(true);
            } else {

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
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-center gap-x-3
                transition-all duration-500 ease-in-out 
                ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>

            <div className='dark:bg-neutral-900 bg-neutral-200 border dark:border-neutral-700 border-neutral-300 px-2 py-[5px] rounded-lg'>
                <div className="flex items-center justify-between gap-x-2 w-full">
                    <div className="w-8 h-7 bg-primary flex items-center justify-center px-[2px] rounded-sm">
                        <NocturnLogo className="w-12 h-auto" />
                    </div>
                    <div className="flex flex-row items-center justify-center gap-x-3">
                        <NavItems items={navItems} />
                        <DarkModeToggle />
                        <div className="w-px h-6 border-l-1 dark:border-neutral-500 border-neutral-600" />
                        <a className={`relative text-neutral-600 dark:text-neutral-300 px-2 py-0.5 text-xs`}>
                            <span className="relative z-20">products</span>
                        </a>
                    </div>
                </div>
            </div>

            <NavbarSigninAction />
        </div>
    );
}
