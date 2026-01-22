'use client';
import { cn } from '@/lib/utils';
import NavItems from './NavItems';
import { Button } from '../ui/button';
import { BsBoxArrowInRight } from 'react-icons/bs';

interface NavItem {
    label: string;
    link: string;
    onClick?: () => void;
}

const navItems: NavItem[] = [
    {
        label: 'Home',
        link: '/home',
    },
    { label: 'Roles', link: '/roles' },
    { label: 'Features', link: '/features' },
    { label: 'About', link: '/about' },
];

export default function NavbarTest() {
    return (
        <div
            className={cn(
                'w-full h-21 px-8 fixed z-40 flex items-center justify-between transition-all duration-500 ease-in-out',
                // isNavbarVisible
                //     ? 'translate-y-0'
                //     : '-translate-y-[calc(100%+1rem)] pointer-events-none',
            )}
        >
            <div className="text-black text-2xl tracking-wide font-semibold">Nocturn</div>

            <div className="flex">
                <NavItems items={navItems} className="absolute left-1/2 top-4.5 -translate-x-1/2" />
            </div>

            <div className="flex gap-x-3 text-black text-2xl items-center">
                <Button
                    className={cn(
                        '!px-5.5 h-12',
                        'rounded-full text-base',
                        'bg-[#eec444] hover:bg-[#eec444] text-black tracking-wide',
                        'flex items-center',
                    )}
                >
                    Enter Quiz
                    <BsBoxArrowInRight className="size-5" />
                </Button>

                <Button
                    className={cn(
                        'bg-[#1b1b1b] text-white',
                        '!px-5.5 h-12',
                        'rounded-full text-base',
                        'hover:bg-[#1b1b1b] ',
                    )}
                >
                    Get Started
                </Button>
            </div>
        </div>
    );
}
