'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NavCenter() {
    const [active, setActive] = useState<string | null>(null);
    const router = useRouter();

    return (
        <div
            className="relative flex items-center bg-[#f6f6f7] ring-1 ring-black/5 text-dark-base h-11 rounded-full shadow-xs shadow-black/5 p-1 gap-x-1"
            onMouseLeave={() => setActive(null)}
        >
            <div className="relative" onMouseEnter={() => setActive('home')}>
                {active === 'home' && (
                    <motion.div
                        layoutId="nav-pill"
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 35,
                        }}
                        className="absolute inset-0 bg-[#ddddf7] rounded-full"
                    />
                )}
                <button className="relative z-10 text-[15px] font-medium px-7 h-9 rounded-full cursor-pointer">
                    Home
                </button>
            </div>

            <div className="w-[1.5px] rounded-xs h-3 bg-[#ceceee]" />

            {/* FEATURES */}
            <div className="relative" onMouseEnter={() => setActive('features')}>
                {active === 'features' && (
                    <motion.div
                        layoutId="nav-pill"
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 35,
                        }}
                        className="absolute inset-0 bg-[#ddddf7] rounded-full"
                    />
                )}
                <button className="relative z-10 text-[15px] font-medium px-7 h-9 rounded-full cursor-pointer">
                    Features
                </button>
            </div>

            <div className="w-[1.5px] rounded-xs h-3 bg-[#ceceee]" />

            {/* PRICING */}
            <div className="relative" onMouseEnter={() => setActive('faq')}>
                {active === 'faq' && (
                    <motion.div
                        layoutId="nav-pill"
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 35,
                        }}
                        className="absolute inset-0 bg-[#ddddf7] rounded-full"
                    />
                )}
                <button
                    onClick={() => router.push('/premium')}
                    className="relative z-10 text-[15px] font-medium px-7 h-9 rounded-full cursor-pointer"
                >
                    Pricing
                </button>
            </div>

            <div className="w-[1.5px] rounded-xs h-3 bg-[#ceceee]" />

            {/* ABOUT */}
            <div className="relative" onMouseEnter={() => setActive('about')}>
                {active === 'about' && (
                    <motion.div
                        layoutId="nav-pill"
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 35,
                        }}
                        className="absolute inset-0 bg-[#ddddf7] rounded-full"
                    />
                )}
                <button className="relative z-10 text-[15px] font-medium px-7 h-9 rounded-full cursor-pointer">
                    About
                </button>
            </div>
        </div>
    );
}
