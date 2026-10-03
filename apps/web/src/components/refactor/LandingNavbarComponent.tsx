'use client';
import Link from 'next/link';
import { audio } from '../test/LandingFooter';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import NavResourcesDropdown from './NavResourcesDropdown';
import SigninModal from '../utility/SigninModal';
import { RiArrowDownSLine } from 'react-icons/ri';

export default function LandingNavbarComponent() {
    const { session, openSigninModal, setOpenSigninModal } = useUserSessionStore();
    const router = useRouter();
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [atTop, setAtTop] = useState<boolean>(true);
    const [showResources, setShowResources] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleScroll() {
            setAtTop(window.scrollY < 50);
        }
        handleScroll();
        document.addEventListener('scroll', handleScroll, { passive: true });
        return () => document.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            if (openSigninModal) setOpenSigninModal(false);
            setMobileOpen(false);
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openSigninModal, setOpenSigninModal]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
        const container = containerRef.current;
        const item = e.currentTarget;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        setBgStyle({
            left: itemRect.left - containerRect.left,
            width: itemRect.width,
        });
    };

    function handleAuth() {
        setMobileOpen(false);
        if (!session) {
            setOpenSigninModal(true);
            return;
        }
        router.push('/home');
    }

    function navigate(url: string) {
        setMobileOpen(false);
        router.push(url);
    }

    return (
        <header className="fixed inset-x-0 top-0 z-30 flex justify-center px-3 md:px-6">
            <motion.nav
                animate={{ height: atTop ? 72 : 56, marginTop: atTop ? 8 : 12 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className={`relative w-full flex items-center justify-between px-4 sm:px-5 transition-[max-width,background-color,border-radius,box-shadow,backdrop-filter] duration-400 ease-out ${
                    atTop && !mobileOpen
                        ? 'max-w-270 rounded-2xl bg-transparent border border-transparent'
                        : 'max-w-3xl rounded-2xl md:rounded-full bg-white/75 backdrop-blur-xl border border-dark-alpha/8 shadow-[0_8px_32px_rgba(12,12,12,0.08),0_1px_2px_rgba(12,12,12,0.04)]'
                }`}
            >
                <Link
                    href="/"
                    aria-label="Nocturn home"
                    className="inline-flex items-center gap-x-2 text-dark-alpha"
                >
                    {/* Crescent moon + sparkle mark, drawn in a single color so the
                        reviewer-requested black comes from the text color. */}
                    <svg
                        width={26}
                        height={26}
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        aria-hidden="true"
                        className="shrink-0"
                    >
                        <path d="M16 2A14 14 0 1 0 30 16 14 14 0 0 1 16 2Z" />
                        <path d="M25.5 2.5Q26.1 5.9 29.5 6.5Q26.1 7.1 25.5 10.5Q24.9 7.1 21.5 6.5Q24.9 5.9 25.5 2.5Z" />
                    </svg>
                    <span className={`${audio.className} text-[17px] leading-none`}>Nocturn</span>
                </Link>

                <div className="flex items-center gap-x-2 sm:gap-x-3 text-dark-base/90">
                    <div
                        ref={containerRef}
                        className="relative hidden md:flex items-center gap-x-1"
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        <AnimatePresence>
                            {hoveredIdx !== null && (
                                <motion.div
                                    key="nav-hover-bg"
                                    className="absolute top-0 h-full bg-dark-alpha/6 rounded-full pointer-events-none"
                                    initial={{
                                        left: bgStyle.left,
                                        width: bgStyle.width,
                                        opacity: 0,
                                        scale: 0.8,
                                    }}
                                    animate={{
                                        left: bgStyle.left,
                                        width: bgStyle.width,
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                        </AnimatePresence>

                        {navItems.map((item, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => router.push(`/${item.redirectUrl}`)}
                                onMouseEnter={(e) => {
                                    setHoveredIdx(idx);
                                    handleMouseEnter(e);
                                    if (item.name === 'Resources') {
                                        if (resourcesTimeoutRef.current)
                                            clearTimeout(resourcesTimeoutRef.current);
                                        setShowResources(true);
                                    }
                                }}
                                onMouseLeave={() => {
                                    if (item.name === 'Resources') {
                                        resourcesTimeoutRef.current = setTimeout(
                                            () => setShowResources(false),
                                            150,
                                        );
                                    }
                                }}
                                className="relative text-[14.5px] font-medium tracking-wide h-9 w-fit flex items-center justify-center px-4 rounded-full cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-alpha/60"
                            >
                                {item.name}
                                {item.name === 'Resources' && (
                                    <RiArrowDownSLine
                                        size={16}
                                        aria-hidden
                                        className={`ml-0.5 -mr-1 transition-transform duration-200 ${
                                            showResources ? 'rotate-180' : ''
                                        }`}
                                    />
                                )}
                                {item.name === 'Resources' && (
                                    <AnimatePresence>
                                        {showResources && (
                                            <NavResourcesDropdown
                                                onMouseEnter={() => {
                                                    if (resourcesTimeoutRef.current)
                                                        clearTimeout(resourcesTimeoutRef.current);
                                                    setShowResources(true);
                                                }}
                                                onMouseLeave={() => {
                                                    resourcesTimeoutRef.current = setTimeout(
                                                        () => setShowResources(false),
                                                        150,
                                                    );
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                )}
                            </button>
                        ))}
                    </div>

                    <motion.button
                        initial={{ opacity: 0, scale: 0.9, y: 16 }}
                        animate={{ opacity: 1, scale: [0.9, 1.06, 1], y: [16, -6, 0] }}
                        transition={{
                            opacity: { duration: 0.15 },
                            scale: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                            y: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                        }}
                        onClick={handleAuth}
                        className="bg-dark-base text-light-base text-[14.5px] font-medium h-9 px-5 rounded-full shadow-xs cursor-pointer! transition-all transform duration-200 ease-in-out hover:bg-dark-alpha active:scale-102 inset-shadow-xs inset-shadow-white/30 dark:prem-surface"
                    >
                        {session ? 'Go to Home' : 'Log in'}
                    </motion.button>

                    <button
                        type="button"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((open) => !open)}
                        className="relative md:hidden flex flex-col items-center justify-center size-9 rounded-full cursor-pointer gap-y-1.5"
                    >
                        <motion.span
                            animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                            className="block h-[1.5px] w-5 bg-dark-base rounded-full"
                        />
                        <motion.span
                            animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                            className="block h-[1.5px] w-5 bg-dark-base rounded-full"
                        />
                    </button>
                </div>

                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.98 }}
                            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                            className="absolute md:hidden top-full inset-x-0 mt-2 p-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-dark-alpha/8 shadow-[0_16px_48px_rgba(12,12,12,0.12),0_2px_4px_rgba(12,12,12,0.04)]"
                        >
                            {mobileItems.map((item) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => navigate(item.redirectUrl)}
                                    className="w-full flex items-center justify-between px-3.5 h-11 rounded-xl text-[15px] text-dark-base/90 cursor-pointer active:bg-light-base transition-colors"
                                >
                                    {item.name}
                                    {item.tag && (
                                        <span className="text-[11px] font-medium text-alpha bg-alpha/8 px-2 py-0.5 rounded-full">
                                            {item.tag}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
            <SigninModal />
        </header>
    );
}

const navItems = [
    { name: 'Features', redirectUrl: '' },
    { name: 'About', redirectUrl: 'about' },
    { name: 'Premium', redirectUrl: 'premium' },
    { name: 'Resources', redirectUrl: '' },
];

const mobileItems = [
    { name: 'Features', redirectUrl: '/' },
    { name: 'About', redirectUrl: '/about' },
    { name: 'Premium', redirectUrl: '/premium' },
    { name: 'USDC Integration', redirectUrl: '/resources/usdc-integration', tag: 'Resource' },
    { name: 'AI Generation', redirectUrl: '/resources/ai-generation', tag: 'Resource' },
];
