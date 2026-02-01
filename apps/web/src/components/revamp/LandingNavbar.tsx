'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { HiOutlineMinus, HiOutlinePlusSmall } from 'react-icons/hi2';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Image from 'next/image';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import LogoutModal from '../utility/LogoutModal';
import { useRouter } from 'next/navigation';

const springTransition = {
    type: 'spring' as const,
    stiffness: 320,
    damping: 26,
};

const navItem: Variants = {
    hidden: (index: number) => ({
        y: -90,
        opacity: 0,
        transition: {
            ...springTransition,
            delay: index * 0.06,
        },
    }),
    visible: (index: number) => ({
        y: 0,
        opacity: 1,
        transition: {
            ...springTransition,
            delay: index * 0.07,
        },
    }),
};

export default function LandingNavbar() {
    const { session, setOpenSigninModal, setOpenLogoutModal } = useUserSessionStore();
    const [isNavbarVisible, setIsNavbarVisible] = useState<boolean>(true);
    const [lastScrollY, setLastScrollY] = useState<number>(0);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const router = useRouter();

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
        <div
            className={cn(
                'w-full h-21 px-6 fixed z-40 flex items-center justify-between transition-all duration-500 ease-in-out',
                isNavbarVisible
                    ? 'translate-y-0'
                    : '-translate-y-[calc(100%+1rem)] pointer-events-none',
            )}
        >
            <div className="h-11 w-11 bg-dark-base rounded-full flex justify-center items-center overflow-hidden">
                <Image
                    src="/images/cat.png"
                    alt="Cat logo"
                    width={60}
                    height={60}
                    priority
                    className="mt-1.5 ml-1"
                />
            </div>

            <div className="flex gap-x-2.5 items-center">
                <div
                    className="flex gap-x-2.5 items-center"
                    onMouseEnter={() => setIsMenuOpen(true)}
                    onMouseLeave={() => setIsMenuOpen(false)}
                >
                    <AnimatePresence>
                        {isMenuOpen && (
                            <>
                                <motion.div
                                    custom={2}
                                    variants={navItem}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.015,
                                            y: -1,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                            y: 0,
                                        }}
                                        transition={{
                                            type: 'tween',
                                            duration: 0.15,
                                            ease: 'easeOut',
                                        }}
                                        className="bg-dark-faded text-light-base text-[18px] h-11 w-24 rounded-full shadow-xs cursor-pointer"
                                    >
                                        Home
                                    </motion.button>
                                </motion.div>

                                <motion.div
                                    custom={1}
                                    variants={navItem}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.015,
                                            y: -1,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                            y: 0,
                                        }}
                                        transition={{
                                            type: 'tween',
                                            duration: 0.15,
                                            ease: 'easeOut',
                                        }}
                                        className="bg-dark-faded text-light-base text-[18px] h-11 w-29 rounded-full shadow-xs cursor-pointer"
                                    >
                                        Features
                                    </motion.button>
                                </motion.div>

                                <motion.div
                                    custom={0}
                                    variants={navItem}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.015,
                                            y: -1,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                            y: 0,
                                        }}
                                        transition={{
                                            type: 'tween',
                                            duration: 0.15,
                                            ease: 'easeOut',
                                        }}
                                        className="bg-dark-faded text-light-base cursor-pointer text-[18px] h-11 w-25 rounded-full shadow-xs"
                                    >
                                        About
                                    </motion.button>
                                </motion.div>

                                <motion.div
                                    custom={0}
                                    variants={navItem}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.015,
                                            y: -1,
                                        }}
                                        whileTap={{
                                            scale: 0.98,
                                            y: 0,
                                        }}
                                        transition={{
                                            type: 'tween',
                                            duration: 0.15,
                                            ease: 'easeOut',
                                        }}
                                        className="bg-dark-faded text-light-base cursor-pointer text-[18px] h-11 w-20 rounded-full shadow-xs"
                                    >
                                        Faq
                                    </motion.button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <Button className="relative h-11 w-11 bg-dark-faded hover:bg-dark-faded shadow-xs text-light-base rounded-full overflow-hidden">
                        <motion.span
                            animate={isMenuOpen ? 'open' : 'closed'}
                            variants={{
                                closed: { rotate: 0, scale: 1, opacity: 1 },
                                open: { rotate: 180, scale: 0.6, opacity: 0 },
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <HiOutlinePlusSmall className="size-6.5" />
                        </motion.span>

                        <motion.span
                            animate={isMenuOpen ? 'open' : 'closed'}
                            variants={{
                                closed: { scale: 0.6, opacity: 0 },
                                open: { scale: 1, opacity: 1 },
                            }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <HiOutlineMinus className="size-6.5" />
                        </motion.span>
                    </Button>
                </div>

                {session?.user.token ? (
                    <div className="flex gap-x-2.5">
                        <motion.button
                            // whileHover={{
                            //     scale: 1.03,
                            //     y: -1,
                            // }}
                            whileTap={{
                                scale: 0.98,
                                y: 0,
                            }}
                            transition={{
                                type: 'tween',
                                duration: 0.15,
                                ease: 'easeOut',
                            }}
                            onClick={() => {
                                if (!session.user.token) return;
                                router.push('/home');
                            }}
                            className="bg-nradiant hover:bg-nradiant text-dark-base text-[18px] h-11 w-33 rounded-full shadow-xs cursor-pointer hover:scale-103 hover:-translate-y-0.5 transition-all transform duration-200 ease-in-out"
                        >
                            Get Started
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
                            className="h-11 w-11 relative rounded-full border-[2px] border-nradiant overflow-hidden cursor-pointer hover:scale-103 hover:-translate-y-0.5 transition-all transform duration-300 shadow-xs"
                            onClick={handleAuthClick}
                        >
                            <Image
                                src={session.user.image}
                                alt={session.user.name}
                                fill
                                unoptimized
                            />
                        </motion.div>
                    </div>
                ) : (
                    <Button
                        onClick={() => setOpenSigninModal(true)}
                        className="bg-nradiant hover:bg-nradiant hover:flip-horizontal-bottom text-[18px] h-11 w-24 rounded-full shadow-xs"
                    >
                        Sign In
                    </Button>
                )}
            </div>
            <LogoutModal />
        </div>
    );
}
