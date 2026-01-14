'use client';

import { cn } from '@/lib/utils';
import NavItems from './NavItems';
import Image from 'next/image';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Input } from '../ui/input';
import SigninModal from '../utility/SigninModal';
import LogoutModal from '../utility/LogoutModal';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
    label: string;
    link: string;
    onClick: () => void;
}

export default function Navbar() {
    const { session, setOpenSigninModal, setOpenLogoutModal } = useUserSessionStore();
    const isLoggedIn = !!session?.user?.id;
    const [showInputBox, setShowInputBox] = useState<boolean>(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);

    useEffect(() => {
        function handleScroll() {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY) {
                setIsNavbarVisible(true);
            } else if (currentScrollY > lastScrollY) {
                setIsNavbarVisible(false);
            }

            setLastScrollY(currentScrollY);
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    function handleAuthClick() {
        if (isLoggedIn) {
            setOpenLogoutModal(true);
        } else {
            setOpenSigninModal(true);
        }
    }

    const navItems: NavItem[] = [
        { label: 'Home', link: '/home', onClick: () => {} },
        { label: 'Features', link: '/features', onClick: () => {} },
        { label: 'Invoicing', link: '/invoicing', onClick: () => {} },
        { label: 'Docs', link: '/docs', onClick: () => {} },
    ];

    return (
        <div
            className={cn(
                'w-full h-20 px-3 fixed z-40 flex items-center justify-between transition-all duration-500 ease-in-out',
                isNavbarVisible
                    ? 'translate-y-0'
                    : '-translate-y-[calc(100%+1rem)] pointer-events-none',
            )}
        >
            <div className="flex">
                <NavItems items={navItems} className="absolute left-1/2 top-4 -translate-x-1/2" />
            </div>

            <div className="flex items-center gap-x-4 h-15 w-fit rounded-[4px] mr-3 top-3.5 absolute right-10.5">
                <div className="relative flex items-center">
                    <Button
                        onClick={() => setShowInputBox((prev) => !prev)}
                        className="h-13 text-[15px] rounded-[8px] bg-white text-tprime font-semibold z-10 tracking-widest hover:bg-white !px-6 shadow-sm shadow-black/10 ring-1 ring-black/10"
                    >
                        Enter Quiz
                    </Button>

                    <AnimatePresence>
                        {showInputBox && (
                            <motion.div
                                className="absolute top-full mt-3 right-0"
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 10, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                                <Input
                                    placeholder="secret code"
                                    className="font-mono h-13 !bg-white border border-black w-40 px-4 rounded-[8px]"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {session?.user ? (
                    <div
                        className="h-13 w-13 relative rounded-full border border-black overflow-hidden flex justify-center items-center text-tprime cursor-pointer shadow-button"
                        onClick={handleAuthClick}
                    >
                        <Image
                            src={session.user.image}
                            alt={session.user.name}
                            fill
                            className="cursor-pointer"
                        />
                    </div>
                ) : (
                    <Button
                        onClick={() => setOpenSigninModal(true)}
                        className="h-13 text-[15px] rounded-2 bg-yellow-300 text-tprime font-semibold shadow-button z-10 tracking-widest hover:bg-yellow-300 !px-6"
                    >
                        Sign In
                    </Button>
                )}
            </div>

            <SigninModal />
            <LogoutModal />
        </div>
    );
}
