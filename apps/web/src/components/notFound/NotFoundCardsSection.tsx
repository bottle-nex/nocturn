'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiOutlineHome, HiOutlineSparkles, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';

const links = [
    {
        icon: HiOutlineHome,
        title: 'Home',
        description: 'Return to the main page',
        href: '/',
        colorClass: 'bg-[#c4b6ff]',
    },
    {
        icon: HiOutlineSparkles,
        title: 'Explore Quizzes',
        description: 'Browse community quizzes',
        href: '/',
        colorClass: 'bg-[#ffd1b6]',
    },
    {
        icon: HiOutlineChatBubbleLeftRight,
        title: 'Support',
        description: 'Get help from our team',
        href: '/',
        colorClass: 'bg-[#b6ffda]',
    },
];

export default function NotFoundCardsSection() {
    return (
        <div className="w-full max-w-270 mx-auto py-20 px-6">
            <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-3xl font-semibold text-dark-base text-center mb-3"
            >
                Where to next?
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                className="text-base text-dark-base/50 text-center mb-14 max-w-md mx-auto"
            >
                We couldn&apos;t find your page, but there&apos;s plenty more to explore.
            </motion.p>

            <div className="flex justify-center gap-6">
                {links.map((link, i) => (
                    <motion.div
                        key={link.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.4,
                            ease: 'easeOut',
                            delay: 0.15 + i * 0.08,
                        }}
                    >
                        <Link
                            href={link.href}
                            className="group flex flex-col items-center gap-4 w-64 rounded-2xl border border-dark-base/[0.06] bg-light-base p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                        >
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${link.colorClass}`}
                            >
                                <link.icon className="w-5.5 h-5.5 text-dark-base/80" />
                            </div>
                            <div className="text-center">
                                <div className="text-[16px] font-semibold text-dark-base/90">
                                    {link.title}
                                </div>
                                <div className="text-sm text-dark-base/45 mt-1">
                                    {link.description}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
