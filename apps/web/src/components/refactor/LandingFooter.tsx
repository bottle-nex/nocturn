import { FaXTwitter, FaInstagram, FaLinkedinIn, FaDiscord, FaGithub } from 'react-icons/fa6';

const footerLinks = {
    Resources: ['Blog', 'Brand', 'FAQ', 'Help & Support', 'Community'],
    Developers: ['Documentation', 'API Reference', 'Open Source', 'Security', 'Bug Bounty'],
    About: ['Nocturn Labs', 'Careers', 'Contact', 'Press'],
    'Legal & Privacy': ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

const socialIcons = [
    { icon: FaXTwitter, label: 'X' },
    { icon: FaInstagram, label: 'Instagram' },
    { icon: FaLinkedinIn, label: 'LinkedIn' },
    { icon: FaDiscord, label: 'Discord' },
    { icon: FaGithub, label: 'GitHub' },
];

export default function LandingFooter() {
    return (
        <main className="w-full max-w-270 mx-auto py-16">
            <footer className="w-full  pb-0">
                <div className="rounded-3xl bg-dark-base/10 pt-14 pb-0 overflow-hidden">
                    {/* Top section */}
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 px-10 md:px-14">
                        {/* Left: Logo + Description */}
                        <div className="lg:w-[38%] flex flex-col gap-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-dark-base" />
                                <span className="text-xl font-semibold text-dark-base tracking-tight">
                                    nocturn
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed text-dark-base/50 max-w-sm">
                                Nocturn is a live quiz platform where knowledge pays off. Compete in
                                real-time multiplayer quizzes, collaborate on quiz creation, and win
                                prizes from blockchain-powered prize pools.
                            </p>
                        </div>

                        {/* Right: Link columns */}
                        <div className="lg:w-[62%] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
                            {Object.entries(footerLinks).map(([heading, links]) => (
                                <div key={heading} className="flex flex-col gap-3.5">
                                    <h4 className="text-sm font-semibold text-dark-base">
                                        {heading}
                                    </h4>
                                    <ul className="flex flex-col gap-2.5">
                                        {links.map((link) => (
                                            <li key={link}>
                                                <a
                                                    href="#"
                                                    className="text-sm text-dark-base/45 hover:text-dark-base transition-colors duration-200"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-5 mt-16 mb-8 px-10 md:px-14">
                        {socialIcons.map(({ icon: Icon, label }) => (
                            <a
                                key={label}
                                href="#"
                                aria-label={label}
                                className="text-dark-base/40 hover:text-dark-base transition-colors duration-200"
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </main>
    );
}
