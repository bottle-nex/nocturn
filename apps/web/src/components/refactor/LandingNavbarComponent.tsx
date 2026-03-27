'use client';
import AppLogo from '../app/AppLogo';
import { motion } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useRouter } from 'next/navigation';

export default function LandingNavbarComponent() {
    const { session } = useUserSessionStore();
    const router = useRouter();

    return (
        <div className="h-14 w-full bg-white max-w-270.5 mx-auto border-b border-px border-dark-alpha/7 fixed top-0 flex items-center justify-between px-9 z-10">
            <AppLogo size={105} className="-left-10 top-1 text-dark-base" />

            <div className="flex items-center gap-x-3 text-dark-base/90">
                {navItems.map((item, idx) => (
                    <div
                        key={idx}
                        className="text-[15px] tracking-wide h-8 w-fit hover:bg-light-base hover:text-dark-base flex items-center justify-center px-4 rounded-full cursor-pointer transition-colors transform duration-200"
                    >
                        {item.name}
                    </div>
                ))}

                <motion.button
                    initial={{ opacity: 0, scale: 0.9, y: 16 }}
                    animate={{ opacity: 1, scale: [0.9, 1.06, 1], y: [16, -6, 0] }}
                    transition={{
                        opacity: { duration: 0.15 },
                        scale: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                        y: { duration: 0.45, ease: ['easeOut', 'easeInOut'] },
                    }}
                    onClick={() => {
                        if (!session?.user.token) return;
                        router.push('/home');
                    }}
                    className="bg-dark-base text-light-base text-[15px] h-8.5 w-28 rounded-full shadow-xs cursor-pointer transition-all transform duration-200 ease-in-out active:scale-102 inset-shadow-xs inset-shadow-white/30"
                >
                    Go to Home
                </motion.button>
            </div>
        </div>
    );
}

const navItems = [
    { name: 'Features', redirectUrl: '' },
    { name: 'About', redirectUrl: '' },
    { name: 'Premium', redirectUrl: '' },
    { name: 'Resources', redirectUrl: '' },
];
