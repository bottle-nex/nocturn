'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import LogoutModal from '../utility/LogoutModal';
import { useRouter } from 'next/navigation';
import SigninModal from '../utility/SigninModal';
import AppLogo from '../app/AppLogo';
import NavCenter from './NavCenter';
import Image from 'next/image';

export default function LandingTestNav() {
    const { session, openSigninModal, openLogoutModal, setOpenSigninModal, setOpenLogoutModal } =
        useUserSessionStore();

    const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            if (openSigninModal) setOpenSigninModal(false);
            if (openLogoutModal) setOpenLogoutModal(false);
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openSigninModal, setOpenSigninModal, openLogoutModal, setOpenLogoutModal]);

    useEffect(() => {
        function handleScroll() {
            const currentScrollY = window.scrollY;
            setIsNavbarVisible(currentScrollY < lastScrollY);
            setLastScrollY(currentScrollY);
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    function handleAuthClick() {
        const isLoggedIn = !!session?.user?.id;
        if (isLoggedIn) {
            setOpenLogoutModal(true);
        } else {
            setOpenSigninModal(true);
        }
        // isLoggedIn ? setOpenLogoutModal(true) : setOpenSigninModal(true);
    }

    return (
        <motion.div
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{
                type: 'spring',
                damping: 20,
                mass: 0.8,
                stiffness: 260,
                delay: 0.5,
            }}
            className={cn(
                'w-full h-26 px-10 fixed z-40 flex items-center justify-between transition-all duration-500 ease-in-out',
                isNavbarVisible
                    ? 'translate-y-0'
                    : '-translate-y-[calc(100%+1rem)] pointer-events-none',
            )}
        >
            <div className="-ml-12">
                <AppLogo withText size={120} />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
                <NavCenter />
            </div>

            <div className="flex gap-x-2.5 items-center">
                {session?.user.token ? (
                    <div className="flex gap-x-2.5">
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9, y: 16 }}
                            animate={{ opacity: 1, scale: [0.9, 1.06, 1], y: [16, -6, 0] }}
                            transition={{
                                opacity: { duration: 0.15 },
                                scale: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                                y: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                            }}
                            onClick={() => {
                                if (!session.user.token) return;
                                router.push('/home');
                            }}
                            className="bg-dark-base text-light-base text-[18px] h-12 w-33 rounded-full shadow-xs cursor-pointer transition-all transform duration-200 ease-in-out active:scale-102"
                        >
                            Go to Home
                        </motion.button>

                        <motion.div
                            whileTap={{
                                scale: 0.95,
                                y: 0,
                            }}
                            transition={{
                                type: 'tween',
                                duration: 0.15,
                                ease: 'easeOut',
                            }}
                            className="h-12 w-12 relative rounded-full border-[2px] border-dark-base overflow-hidden cursor-pointer shadow-xs"
                            onClick={handleAuthClick}
                        >
                            <Image
                                src={session.user.image}
                                alt={session.user.name}
                                fill
                                unoptimized
                                className="text-black"
                            />
                        </motion.div>
                    </div>
                ) : (
                    <motion.button
                        onClick={() => setOpenSigninModal(true)}
                        className="bg-alpha hover:bg-alpha text-light-base text-[18px] h-12 w-25 rounded-full shadow-xs cursor-pointer active:scale-95 transition-all transform duration-300"
                    >
                        Sign In
                    </motion.button>
                )}
            </div>

            <LogoutModal />
            <SigninModal />
        </motion.div>
    );
}
