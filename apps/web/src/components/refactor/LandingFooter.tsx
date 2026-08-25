'use client';
import { FaXTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa6';
import AppLogo from '../app/AppLogo';
import PerspectiveCard from '../utility/PerspectiveCard';
import { JSX } from 'react';
import { motion } from 'framer-motion';

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

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const popIn = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const },
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
                            animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
                            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                            className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-alpha/25 blur-3xl"
                        />
                        <motion.div
                            aria-hidden
                            animate={{ y: [0, 16, 0], x: [0, -14, 0] }}
                            transition={{
                                duration: 11,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.8,
                            }}
                            className="pointer-events-none absolute top-10 right-0 h-80 w-80 rounded-full bg-eta/15 blur-3xl"
                        />
                        <motion.div
                            aria-hidden
                            animate={{ y: [0, -12, 0] }}
                            transition={{
                                duration: 7.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: 0.4,
                            }}
                            className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-nradiant/10 blur-3xl"
                        />

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={staggerContainer}
                            className="relative flex flex-col lg:flex-row gap-12 lg:gap-8 px-10 md:px-14"
                        >
                            <motion.section
                                variants={fadeUp}
                                className="lg:w-[38%] flex flex-col gap-5"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.04, rotate: -2 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="-ml-12 -mt-12 w-fit"
                                >
                                    <AppLogo
                                        withText
                                        size={120}
                                        textColor="text-light-base dark:text-light-base"
                                    />
                                </motion.div>
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
                                        variants={fadeUp}
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
                                                        className="group relative inline-block text-sm text-light-alpha/45 hover:text-light-base transition-colors duration-200"
                                                    >
                                                        {link}
                                                        <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-light-base transition-all duration-300 ease-out group-hover:w-full" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}
                            </section>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.4 }}
                            variants={staggerContainer}
                            className="relative flex items-center gap-5 mt-16 mb-8 px-10 md:px-14"
                        >
                            {socialIcons.map(({ icon: Icon, label, link }) => (
                                <motion.a
                                    key={label}
                                    href={link}
                                    rel={'noreferrer'}
                                    aria-label={label}
                                    target="_blank"
                                    variants={popIn}
                                    style={{ backgroundColor: 'rgba(79,70,229,0)' }}
                                    whileHover={{
                                        scale: 1.15,
                                        rotate: -6,
                                        backgroundColor: 'rgba(79,70,229,0.18)',
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-light-alpha/40 hover:text-light-base transition-colors duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </motion.a>
                            ))}
                        </motion.div>
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
