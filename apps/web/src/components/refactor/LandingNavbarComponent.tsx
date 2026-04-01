'use client';
import AppLogo from '../app/AppLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import NavResourcesDropdown from './NavResourcesDropdown';
import SigninModal from '../utility/SigninModal';

export default function LandingNavbarComponent() {
    const { session, openSigninModal, setOpenSigninModal } = useUserSessionStore();
    const router = useRouter();
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [atTop, setAtTop] = useState<boolean>(true);
    const [showResources, setShowResources] = useState(false);
    const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        function handleScroll() {
            setAtTop(window.scrollY < 50);
        }
        document.addEventListener('scroll', handleScroll);
        return () => document.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;
            if (openSigninModal) setOpenSigninModal(false);
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [openSigninModal, setOpenSigninModal]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
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
        if (!session) {
            setOpenSigninModal(true);
            return;
        }
        router.push('/home');
    }

    return (
        <motion.div
            animate={{ height: atTop ? 80 : 56 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            className={`w-full bg-white max-w-270.5 mx-auto fixed top-0 flex items-center justify-between px-9 z-30 ${atTop ? '' : 'border-b border-px border-dark-alpha/7'}`}
        >
            <AppLogo size={105} className="-left-10 top-1 text-dark-base" />
            <div className="flex items-center gap-x-3 text-dark-base/90">
                <div
                    ref={containerRef}
                    className="relative flex items-center gap-x-3"
                    onMouseLeave={() => setHoveredIdx(null)}
                >
                    <AnimatePresence>
                        {hoveredIdx !== null && (
                            <motion.div
                                key="nav-hover-bg"
                                className="absolute top-0 h-full bg-light-base rounded-full pointer-events-none"
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
                        <div
                            key={idx}
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
                            className="relative text-[15px] tracking-wide h-8 w-fit flex items-center justify-center px-4 rounded-full cursor-pointer z-10"
                        >
                            {item.name}
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
                        </div>
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
                    className="bg-dark-base text-light-base text-[15px] h-8.5 w-28 rounded-full shadow-xs cursor-pointer! transition-all transform duration-200 ease-in-out active:scale-102 inset-shadow-xs inset-shadow-white/30 dark:prem-surface"
                >
                    {session ? "Go to Home" : "Log in"}
                </motion.button>
            </div>
            <SigninModal />
        </motion.div>
    );
}

const navItems = [
    { name: 'Features', redirectUrl: '' },
    { name: 'About', redirectUrl: '' },
    { name: 'Premium', redirectUrl: '' },
    { name: 'Resources', redirectUrl: '' },
];
