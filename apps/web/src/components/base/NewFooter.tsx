'use client';

import { BsDot } from 'react-icons/bs';
import { MdCopyright } from 'react-icons/md';

export default function NewFooter() {
    return (
        <footer className="bg-[#141414] w-full flex flex-col items-center pt-24 px-20 overflow-hidden">
            <div className="flex justify-between w-full min-h-[70vh]">
                <div className="text-5xl max-w-xl font-semibold leading-[1.15] tracking-wide text-[#FDF9F0]">
                    Play quick quizzes that actually make you smarter.
                </div>

                <div className="flex">
                    <FooterColumn title="PLATFORM" links={platformLinks} />
                    <FooterColumn title="COMPANY" links={companyLinks} />
                    <FooterColumn title="REACH OUT" links={contactLinks} />
                    <FooterColumn title="SOCIALS" links={socialLinks} />
                </div>
            </div>

            <div className="w-full border-t border-b border-dashed border-white/10 flex items-center justify-between py-6 mt-10">
                <div className="flex gap-x-1 items-center text-sm text-white/50">
                    <MdCopyright />
                    <span>All rights reserved 2025</span>
                </div>

                <div className="flex gap-x-2 items-center text-sm text-white/50">
                    <span>Terms</span>
                    <BsDot />
                    <span>Privacy</span>
                </div>
            </div>

            <div className="select-none pointer-events-none text-[21rem] text-[#fdf9f028] font-bold leading-[0.8] tracking-wide mt-16">
                NOCTURN
            </div>
        </footer>
    );
}

interface FooterLink {
    title: string;
    link: string;
}

function FooterColumn({
    title,
    links,
}: {
    title: string;
    links: FooterLink[];
}) {
    return (
        <div className="flex flex-col border-l border-dashed border-white/10 px-10 text-[#FDF9F0]">
            <div className="text-[15px] uppercase text-white/50 tracking-widest mb-4">
                {title}
            </div>

            <div className="flex flex-col gap-y-1 text-[20px]">
                {links.map((item) => (
                    <a
                        key={item.title}
                        href={item.link}
                        className="hover:underline underline-offset-4 transition"
                    >
                        {item.title}
                    </a>
                ))}
            </div>
        </div>
    );
}

const platformLinks = [
    { title: 'Home', link: '/' },
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Quiz', link: '/quiz' },
    { title: 'Documentation', link: '/docs' },
];

const companyLinks = [
    { title: 'Security', link: '/security' },
    { title: 'Founders', link: '/founders' },
    { title: 'Contributors', link: '/contributors' },
];

const contactLinks = [
    { title: 'Mail', link: 'mailto:hello@nocturn.app' },
    { title: 'Blog', link: '/blog' },
];

const socialLinks = [
    { title: 'Twitter', link: 'https://twitter.com' },
    { title: 'GitHub', link: 'https://github.com' },
    { title: 'LinkedIn', link: 'https://linkedin.com' },
];
