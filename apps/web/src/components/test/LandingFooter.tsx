import { cn } from '@/lib/utils';
import { Audiowide } from 'next/font/google';
import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdOutlineCopyright } from 'react-icons/md';

const audio = Audiowide({
    subsets: ['latin'],
    weight: ['400'],
});

const links = {
    row_one: [
        { name: 'Home', href: '#' },
        { name: 'Features', href: '#' },
        { name: 'Pricing', href: '#' },
        { name: 'Blog', href: '#' },
    ],
    row_two: [
        { name: 'About Us', href: '#' },
        { name: 'Contact', href: '#' },
        { name: 'Support', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
    ],
};

export default function LandingFooter() {
    return (
        <footer className="h-[70vh] w-screen relative bg-light-base text-[#4f46e5]">
            <div className="h-full w-full flex justify-between pt-20 px-30">
                <div className="flex flex-col gap-y-3">
                    <div className="flex gap-x-4">
                        <div className="h-12 w-12 rounded-full bg-light-base ring-1 ring-black/20 shadow-xs shadow-black/5 flex justify-center items-center cursor-pointer text-dark-base/80 hover:text-dark-alpha transition-colors transform duration-250">
                            <FaXTwitter className="size-5.5" />
                        </div>
                        <div className="h-12 w-12 rounded-full bg-light-base ring-1 ring-black/20 shadow-xs shadow-black/5 flex justify-center items-center cursor-pointer text-dark-base/80 hover:text-dark-alpha transition-colors transform duration-250">
                            <FaGithub className="size-5.5" />
                        </div>
                        <div className="h-12 w-12 rounded-full bg-light-base ring-1 ring-black/20 shadow-xs shadow-black/5 flex justify-center items-center cursor-pointer text-dark-base/80 hover:text-dark-alpha transition-colors transform duration-250">
                            <FaLinkedin className="size-5.5" />
                        </div>
                    </div>

                    <div className="text-dark-base flex items-center gap-x-1">
                        <MdOutlineCopyright className="size-4.5" />
                        2026 All rights reserved
                    </div>
                </div>

                <div className="flex space-x-20">
                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-dark-base text-[18px]">Features</div>
                        <div className="flex flex-col text-base text-dark-base/70 gap-y-1">
                            <a className="hover:underline" href="">
                                Overview
                            </a>
                            <a className="hover:underline" href="">
                                AI Generation
                            </a>
                            <a className="hover:underline" href="">
                                Quiz
                            </a>
                            <a className="hover:underline" href="">
                                Presentaitons
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-dark-base text-[18px]">Resources</div>
                        <div className="flex flex-col text-base text-dark-base/70 gap-y-1">
                            <a className="hover:underline" href="">
                                How to
                            </a>
                            <a className="hover:underline" href="">
                                Templates
                            </a>
                            <a className="hover:underline" href="">
                                Stories
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-dark-base text-[18px]">Details</div>
                        <div className="flex flex-col text-base text-dark-base/70 gap-y-1">
                            <a className="hover:underline" href="">
                                Legal
                            </a>
                            <a className="hover:underline" href="">
                                Policies
                            </a>
                            <a className="hover:underline" href="">
                                Accessibility
                            </a>
                            <a className="hover:underline" href="">
                                Legal
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-1.5">
                        <div className="flex flex-col text-dark-base text-[18px]">About Us</div>
                        <div className="flex flex-col text-base text-dark-base/70 gap-y-1">
                            <a className="hover:underline" href="">
                                The team
                            </a>
                            <a className="hover:underline" href="">
                                Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={cn(
                    'text-[13.1rem] font-semibold text-[#ebebeb] tracking-wider',
                    'absolute left-1/2 -translate-x-1/2 -bottom-8 leading-none',
                    audio.className,
                    // montserrat.className,
                )}
            >
                NOCTURN
            </div>
        </footer>
    );
}
