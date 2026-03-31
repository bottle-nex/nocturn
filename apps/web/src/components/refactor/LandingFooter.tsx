import { FaXTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa6';
import AppLogo from '../app/AppLogo';
import PerspectiveCard from '../utility/PerspectiveCard';

const footerLinks = {
    Resources: ['Blog', 'Brand', 'FAQ', 'Help & Support', 'Community'],
    Developers: ['Documentation', 'API Reference', 'Open Source', 'Security', 'Bug Bounty'],
    About: ['Nocturn Labs', 'Careers', 'Contact', 'Press'],
    'Legal & Privacy': ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
};

const socialIcons = [
    { icon: FaXTwitter, label: 'X' },
    { icon: FaLinkedinIn, label: 'LinkedIn' },
    { icon: FaGithub, label: 'GitHub' },
];

export default function LandingFooter() {
    return (
        <PerspectiveCard className="w-full max-w-270 mx-auto pb-16 mt-15">
            <footer className="w-full  pb-0">
                <main className="rounded-3xl bg-dark-base pt-14 pb-0 overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 px-10 md:px-14">
                        <section className="lg:w-[38%] flex flex-col gap-5">
                            <div className="-ml-12 -mt-12">
                                <AppLogo
                                    withText
                                    size={120}
                                    textColor="text-light-base dark:text-light-base"
                                />
                            </div>
                            <p className="text-sm leading-relaxed text-light-base/50 max-w-sm">
                                Nocturn is a live quiz platform where knowledge pays off. Compete in
                                real-time multiplayer quizzes, collaborate on quiz creation, and win
                                prizes from blockchain-powered prize pools.
                            </p>
                        </section>

                        <section className="lg:w-[62%] grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
                            {Object.entries(footerLinks).map(([heading, links]) => (
                                <div key={heading} className="flex flex-col gap-3.5">
                                    <h4 className="text-sm font-semibold text-light-base">
                                        {heading}
                                    </h4>
                                    <ul className="flex flex-col gap-2.5">
                                        {links.map((link) => (
                                            <li key={link}>
                                                <a
                                                    href="#"
                                                    className="text-sm text-light-alpha/45 hover:text-light-base transition-colors duration-200"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </section>
                    </div>

                    <div className="flex items-center gap-5 mt-16 mb-8 px-10 md:px-14">
                        {socialIcons.map(({ icon: Icon, label }) => (
                            <a
                                key={label}
                                href="#"
                                aria-label={label}
                                className="text-light-alpha/40 hover:text-light-base transition-colors duration-200"
                            >
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </main>
            </footer>
        </PerspectiveCard>
    );
}
