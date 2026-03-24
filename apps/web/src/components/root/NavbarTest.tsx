'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import LogoutModal from '../utility/LogoutModal';
import { useRouter } from 'next/navigation';
import NavInputBox from './NavInputBox';
import { useEffect, useState } from 'react';
import userQuizAction from '@/lib/backend/base/user-quiz-action';

// interface NavItem {
//     label: string;
//     link: string;
// }

// const navItems: NavItem[] = [
//     { label: 'Home', link: '/home' },
//     { label: 'Roles', link: '/roles' },
//     { label: 'Features', link: '/features' },
//     { label: 'About', link: '/about' },
// ];

export default function NavbarTest() {
    const { session, setOpenSigninModal, setOpenLogoutModal } = useUserSessionStore();

    const isLoggedIn = !!session?.user?.id;
    const router = useRouter();

    const [showJoinInput, setShowJoinInput] = useState(false);
    const [quizCode, setQuizCode] = useState('');

    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

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
        if (isLoggedIn) {
            setOpenLogoutModal(true);
        } else {
            setOpenSigninModal(true);
        }
    }

    async function handleJoinQuiz() {
        if (!quizCode.trim()) return;

        try {
            const quizId = await userQuizAction.joinQuiz(quizCode.trim());
            setQuizCode('');
            setShowJoinInput(false);

            if (!quizId) return;
            router.push(`/live/${quizId}`);
        } catch (err) {
            console.error('Failed to join quiz', err);
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
            <div className="text-black text-2xl font-semibold">Nocturn</div>

            <div className="flex gap-x-3 items-center">
                <div className="relative flex items-center">
                    <motion.button
                        onClick={() => setShowJoinInput((v) => !v)}
                        className="relative z-10"
                    >
                        <motion.div
                            onClick={handleJoinQuiz}
                            className="px-5.5 h-12 rounded-alpha bg-nradiant text-black flex items-center cursor-pointer"
                        >
                            Enter Quiz
                        </motion.div>
                    </motion.button>

                    <AnimatePresence>
                        {showJoinInput && (
                            <NavInputBox
                                value={quizCode}
                                onChange={setQuizCode}
                                onEnter={handleJoinQuiz}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {session?.user?.token ? (
                    <div className="flex gap-x-2">
                        <button
                            className="bg-[#1b1b1b] text-white px-5.5 h-12 rounded-alpha"
                            onClick={() => router.push('/home')}
                        >
                            Get Started
                        </button>

                        <div
                            className="h-12 w-12 relative rounded-full border overflow-hidden cursor-pointer"
                            onClick={handleAuthClick}
                        >
                            <Image src={session.user.image} alt={session.user.name} fill />
                        </div>
                    </div>
                ) : (
                    <button
                        className="bg-[#1b1b1b] text-white px-5.5 h-12 rounded-full"
                        onClick={() => setOpenSigninModal(true)}
                    >
                        Sign In
                    </button>
                )}

                <LogoutModal />
            </div>
        </div>
    );
}
