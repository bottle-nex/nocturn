'use client';

import { cn } from '@/lib/utils';
import NavItems from './NavItems';
import Image from 'next/image';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import SigninModal from '../utility/SigninModal';
import LogoutModal from '../utility/LogoutModal';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJoinQuizStore } from '@/store/home/useJoinQuizStore';
import NavInputBox from './NavInputBox';
import { useRouter } from 'next/navigation';

interface NavItem {
    label: string;
    link: string;
    onClick?: () => void;
}

export default function Navbar() {
    const { session, setOpenSigninModal, setOpenLogoutModal } = useUserSessionStore();
    const isLoggedIn = !!session?.user?.id;
    const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);
    const { showJoinInput, toggleJoinInput } = useJoinQuizStore();
    const router = useRouter();

    function handleOnClick() {
        if (!session || !session.user.token) {
            setOpenSigninModal(true);
            return;
        }
        router.push('/home');
    }

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
        {
            label: 'Home',
            link: '/home',
            onClick: () => {
                handleOnClick();
            },
        },
        { label: 'Roles', link: '/roles' },
        { label: 'Features', link: '/features' },
        { label: 'About', link: '/about' },
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
            {/* navbar */}
            <div className="flex">
                <NavItems items={navItems} className="absolute left-1/2 top-4 -translate-x-1/2" />
            </div>

            {/* right buttons */}
            <div className="flex items-center gap-x-3 h-15 w-fit rounded-alpha mr-3 top-3.5 absolute right-7">
                <div className="relative flex items-center">
                    <motion.button
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 40,
                        }}
                        onClick={toggleJoinInput}
                        className={cn('relative z-10 cursor-pointer focus:outline-none')}
                    >
                        <motion.div
                            whileHover={{
                                scale: 1.01,
                                y: -2,
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
                            }}
                            whileTap={{
                                scale: 0.98,
                                y: 0,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.18)',
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8,
                            }}
                            className={cn(
                                'h-12',
                                'shadow-[0px_4px_8px_0px_rgba(0,0,0,0.18)]',
                                '!px-6.5',
                                'rounded-full',
                                'bg-ndarkest',
                                'text-nlighter',
                                'text-base',
                                'tracking-wider',
                                'shadow-sm shadow-black/10',
                                'ring-1 ring-black/10',
                                'flex items-center justify-center',
                                'select-none',
                            )}
                        >
                            <span>Enter Quiz</span>
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>{showJoinInput && <NavInputBox />}</AnimatePresence>
                </div>

                {session?.user ? (
                    <div
                        className="h-12 w-12 relative rounded-full border-3 border-nradiant overflow-hidden flex justify-center items-center text-tprime cursor-pointer"
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
                    <motion.button
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 40,
                        }}
                        onClick={() => setOpenSigninModal(true)}
                        className={cn('relative z-10 cursor-pointer focus:outline-none')}
                    >
                        <motion.div
                            whileHover={{
                                scale: 1.01,
                                y: -2,
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
                            }}
                            whileTap={{
                                scale: 0.98,
                                y: 0,
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.18)',
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                                mass: 0.8,
                            }}
                            className={cn(
                                'h-12',
                                'shadow-[0px_4px_8px_0px_rgba(0,0,0,0.18)]',
                                '!px-6.5',
                                'rounded-full',
                                'bg-nradiant',
                                'text-nlighter',
                                'text-ndarkest',
                                'tracking-wider',
                                'shadow-sm shadow-black/10',
                                'ring-1 ring-black/10',
                                'flex items-center justify-center',
                                'select-none',
                            )}
                        >
                            Sign In
                        </motion.div>
                    </motion.button>
                )}
            </div>

            <SigninModal />
            <LogoutModal />
        </div>
    );
}
