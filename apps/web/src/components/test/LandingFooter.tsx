'use client';
import { cn } from '@/lib/utils';
import { Audiowide } from 'next/font/google';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { IoMdArrowUp } from 'react-icons/io';
import { MdOutlineCopyright } from 'react-icons/md';

export const audio = Audiowide({
    subsets: ['latin'],
    weight: ['400'],
});

export default function LandingFooter() {
    const [tinted, setTinted] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleLinkEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setTinted(true);
    };

    const handleLinkLeave = () => {
        timeoutRef.current = setTimeout(() => setTinted(false), 200);
    };

    return (
        <footer className="h-[60vh] w-screen relative bg-dark-base text-[#F3ECE7] overflow-hidden">
            <div className="h-full w-full flex justify-between pt-20 px-30">
                <div className="flex flex-col gap-y-3">
                    <div className="flex gap-x-4">
                        <div className="h-12 w-12 rounded-full ring-1 ring-white/10 shadow-xs shadow-black/10 flex justify-center items-center cursor-pointer text-[#F3ECE7]/80 hover:text-nprimary transition-colors transform duration-250">
                            <FaXTwitter className="size-5.5" />
                        </div>
                        <div className="h-12 w-12 rounded-full ring-1 ring-white/10 shadow-xs shadow-black/10 flex justify-center items-center cursor-pointer text-[#F3ECE7]/80 hover:text-nprimary transition-colors transform duration-250">
                            <FaGithub className="size-5.5" />
                        </div>
                        <div className="h-12 w-12 rounded-full ring-1 ring-white/10 shadow-xs shadow-black/10 flex justify-center items-center cursor-pointer text-[#F3ECE7]/80 hover:text-nprimary transition-colors transform duration-250">
                            <FaLinkedin className="size-5.5" />
                        </div>
                    </div>

                    <div className="text-[#F3ECE7] flex items-center gap-x-1">
                        <MdOutlineCopyright className="size-4.5" />
                        2026 All rights reserved
                    </div>
                </div>

                <div className="flex space-x-20">
                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-[#F3ECE7] text-[18px]">Features</div>
                        <div className="flex flex-col text-base text-[#F3ECE7]/70 gap-y-1">
                            <LinkWrapper
                                href=""
                                label="Overview"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="AI Generation"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Quiz"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Presentations"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-[#F3ECE7] text-[18px]">Resources</div>
                        <div className="flex flex-col text-base text-[#F3ECE7]/70 gap-y-1">
                            <LinkWrapper
                                href=""
                                label="How to"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Templates"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Stories"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-[#F3ECE7] text-[18px]">Details</div>
                        <div className="flex flex-col text-base text-[#F3ECE7]/70 gap-y-1">
                            <LinkWrapper
                                href=""
                                label="Legal"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Policies"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Accessibility"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Legal"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-[#F3ECE7] text-[18px]">About Us</div>
                        <div className="flex flex-col text-base text-[#F3ECE7]/70 gap-y-1">
                            <LinkWrapper
                                href=""
                                label="The team"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                            <LinkWrapper
                                href=""
                                label="Contact Us"
                                tinted={tinted}
                                onEnter={handleLinkEnter}
                                onLeave={handleLinkLeave}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'text-[13.1rem] font-semibold text-light-base/20 tracking-wider',
                    'absolute left-1/2 -translate-x-1/2 -bottom-8 leading-none',
                    'bg-clip-text text-transparent bg-linear-to-b from-light-base/20 to-dark-base',
                    audio.className,
                    // montserrat.className,
                )}
            >
                NOCTURN
            </div>
        </footer>
    );
}

interface LinkWrapperProps {
    href: string;
    label: React.ReactNode;
    tinted: boolean;
    onEnter: () => void;
    onLeave: () => void;
}

function LinkWrapper({ href, label, tinted, onEnter, onLeave }: LinkWrapperProps) {
    const [hovered, setHovered] = useState<boolean>(false);
    return (
        <span
            className={cn(
                'flex items-center gap-x-1 cursor-pointer transition-all duration-100:text-dark-alpha/80 hover:text-light-alpha/80',
                tinted && !hovered ? 'opacity-40' : 'opacity-100',
            )}
            onMouseEnter={() => {
                setHovered(true);
                onEnter();
            }}
            onMouseLeave={() => {
                setHovered(false);
                onLeave();
            }}
        >
            <Link href={href}>{label}</Link>
            <IoMdArrowUp
                className={cn(
                    'size-3.5 rotate-45',
                    hovered ? 'opacity-100 translate-x-1 -translate-y-1' : 'opacity-0',
                    'transition-all transform duration-250',
                )}
            />
        </span>
    );
}
