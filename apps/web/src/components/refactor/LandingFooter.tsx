'use client';
import { FaXTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa6';
import { motion, Variants } from 'framer-motion';
import AppLogo from '../app/AppLogo';
import PerspectiveCard from '../utility/PerspectiveCard';
import { JSX } from 'react';

const footerLinks = {
    Resources: ['Blog', 'Brand', 'FAQ', 'Help & Support', 'Community'],
    Developers: ['Documentation', 'API Reference', 'Open Source', 'Security', 'Bug Bounty'],
    About: ['Nocturn Labs', 'Careers', 'Contact', 'Press'],
    'Legal & Privacy': ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

const socialIcons = [
    { icon: FaXTwitter, label: 'X', link: 'https://x.com' },
    { icon: FaLinkedinIn, label: 'LinkedIn', link: '#' },
    { icon: FaGithub, label: 'GitHub', link: 'https://github.com/bottle-nex/nocturn' },
];

const columnVariants: Variants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

export default function LandingFooter(): JSX.Element {
    return (
        <main className="max-w-270 mx-auto w-full">
            <PerspectiveCard className="w-full mb-3 pb-0! rounded-3xl!">
                <footer className="w-full  pb-0">
                    <main className="relative rounded-3xl bg-dark-base pt-14 pb-0 overflow-hidden">
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute -top-20 -right-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"
                            animate={{ x: [0, -24, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-[#FF8130]/15 blur-3xl"
                            animate={{ x: [0, 26, 0], y: [0, -16, 0], scale: [1, 1.12, 1] }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.8,
                            }}
                        />

                        <motion.div
                            className="relative flex flex-col lg:flex-row gap-12 lg:gap-8 px-10 md:px-14"
                            variants={columnVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-80px' }}
                        >
                            <motion.section
                                variants={fadeUpVariants}
                                className="lg:w-[38%] flex flex-col gap-5"
                            >
                                <div className="-ml-12 -mt-12">
                                    <AppLogo
                                        withText
                                        size={120}
                                        textColor="text-light-base dark:text-light-base"
                                    />
                                </div>
                                <p className="text-sm leading-relaxed text-light-base/50 max-w-sm">
                                    Nocturn is a live quiz platform where knowledge pays off.
                                    Compete in real-time multiplayer quizzes, collaborate on quiz
                                    creation, and win prizes from blockchain-powered prize pools.
                                </p>
                            </motion.section>

                            <section className="lg:w-[62%] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
                                {Object.entries(footerLinks).map(([heading, links]) => (
                                    <motion.div
                                        key={heading}
                                        variants={fadeUpVariants}
                                        className="flex flex-col gap-3.5"
                                    >
                                        <h4 className="text-sm font-semibold text-light-base">
                                            {heading}
                                        </h4>
                                        <ul className="flex flex-col gap-2.5">
                                            {links.map((link) => (
                                                <li key={link}>
                                                    <a
                                                        href="#"
                                                        className="group relative inline-block text-sm text-light-alpha/45 hover:text-light-base transition-colors duration-200 w-fit"
                                                    >
                                                        {link}
                                                        <span className="pointer-events-none absolute left-0 -bottom-0.5 h-px w-0 bg-light-base transition-all duration-300 ease-out group-hover:w-full" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}
                            </section>
                        </motion.div>

                        <div className="relative flex items-center gap-5 mt-16 mb-8 px-10 md:px-14">
                            {socialIcons.map(({ icon: Icon, label, link }) => (
                                <motion.a
                                    key={label}
                                    href={link}
                                    rel={'noreferrer'}
                                    aria-label={label}
                                    target="_blank"
                                    whileHover={{ scale: 1.18, rotate: -8, color: '#ffffff' }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                                    className="text-light-alpha/40 hover:text-light-base"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </main>
                </footer>
            </PerspectiveCard>
            <section className="max-w-270 mx-auto w-full space-y-2 mb-8 mt-3">
                <div className="w-[95%] mx-auto h-1.25 rounded-full bg-[linear-gradient(to_right,#4b6cb7,#7db9e8,#eab308,#ef4444,#8b5cf6,#4b6cb7)] bg-[length:200%_100%] animate-gradient-slide [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]" />
                <div className="w-[90%] mx-auto h-1.25 rounded-full bg-[linear-gradient(to_right,#4b6cb7,#7db9e8,#eab308,#ef4444,#8b5cf6,#4b6cb7)] bg-[length:200%_100%] animate-gradient-slide [animation-delay:0.3s] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] opacity-80" />
                <div className="w-[85%] mx-auto h-1.25 rounded-full bg-[linear-gradient(to_right,#4b6cb7,#7db9e8,#eab308,#ef4444,#8b5cf6,#4b6cb7)] bg-[length:200%_100%] animate-gradient-slide [animation-delay:0.6s] [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] opacity-50" />
            </section>
        </main>
    );
}
