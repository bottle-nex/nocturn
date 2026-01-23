'use client';
import { cn } from '@/lib/utils';
import NavItems from './NavItems';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import LogoutModal from '../utility/LogoutModal';
import { useRouter } from 'next/navigation';
import { useJoinQuizStore } from '@/store/home/useJoinQuizStore';
import NavInputBox from './NavInputBox';
import { useEffect, useState } from 'react';

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
    const { session, setOpenSigninModal, setOpenLogoutModal } = useUserSessionStore();
    const isLoggedIn = !!session?.user?.id;
    const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);
    const { showJoinInput, toggleJoinInput } = useJoinQuizStore();
    const router = useRouter();

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
    return (
        <div
            className={cn(
                'w-full h-21 px-8 fixed z-40 flex items-center justify-between transition-all duration-500 ease-in-out',
                isNavbarVisible
                    ? 'translate-y-0'
                    : '-translate-y-[calc(100%+1rem)] pointer-events-none',
            )}
        >
            <div className="text-black text-2xl tracking-wide font-semibold">Nocturn</div>

            <div className="flex">
                <NavItems items={navItems} className="absolute left-1/2 top-4.5 -translate-x-1/2" />
            </div>

            <div className="flex gap-x-3 text-black text-2xl items-center">
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
                            whileTap={{
                                scale: 0.98,
                                y: 0,
                            }}
                            initial={{ opacity: 0, scale: 0.7, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 320,
                                damping: 18,
                                mass: 0.7,
                            }}
                            className={cn(
                                '!px-5.5 h-12',
                                'rounded-full text-base',
                                'bg-[#FFC221] hover:bg-[#FFC221] text-black tracking-wide',
                                'flex items-center gap-x-2 cursor-pointer',
                            )}
                        >
                            <span>Enter Quiz</span>
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>{showJoinInput && <NavInputBox />}</AnimatePresence>
                </div>
                {session?.user.token ? (
                    <div className="flex gap-x-2.5">
                        <motion.button
                            whileTap={{
                                scale: 0.98,
                                y: 0,
                            }}
                            initial={{ opacity: 0, scale: 0.7, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 320,
                                damping: 18,
                                mass: 0.7,
                            }}
                            className={cn(
                                'bg-[#1b1b1b] text-white',
                                '!px-5.5 h-12',
                                'rounded-full text-base',
                                'hover:bg-[#1b1b1b] cursor-pointer',
                            )}
                            onClick={() => router.push('/home')}
                        >
                            Get Started
                        </motion.button>
                        <div
                            className="h-12 w-12 relative rounded-full border-2 border-[#1b1b1b] overflow-hidden flex justify-center items-center text-tprime cursor-pointer"
                            onClick={handleAuthClick}
                        >
                            <Image
                                src={session.user.image}
                                alt={session.user.name}
                                fill
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                ) : (
                    <motion.button
                        whileTap={{
                            scale: 0.98,
                            y: 0,
                        }}
                        initial={{ opacity: 0, scale: 0.7, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 320,
                            damping: 18,
                            mass: 0.7,
                        }}
                        className={cn(
                            'bg-[#1b1b1b] text-white tracking-wide',
                            '!px-5.5 h-12',
                            'rounded-full text-base',
                            'hover:bg-[#1b1b1b] cursor-pointer',
                        )}
                        onClick={() => setOpenSigninModal(true)}
                    >
                        Sign In
                    </motion.button>
                )}
                <LogoutModal />
            </div>
        </div>
    );
}
