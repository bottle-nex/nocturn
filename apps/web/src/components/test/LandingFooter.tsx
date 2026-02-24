import { cn } from '@/lib/utils';
import { Audiowide } from 'next/font/google';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { MdOutlineCopyright } from 'react-icons/md';

export const audio = Audiowide({
    subsets: ['latin'],
    weight: ['400'],
});

export default function LandingFooter() {
    return (
        <footer className="h-[60vh] w-screen relative bg-dark-base text-[#F3ECE7]">
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
                        <div className="flex flex-col text-[#F3ECE7] text-[18px]">Resources</div>
                        <div className="flex flex-col text-base text-[#F3ECE7]/70 gap-y-1">
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
                        <div className="flex flex-col text-[#F3ECE7] text-[18px]">Details</div>
                        <div className="flex flex-col text-base text-[#F3ECE7]/70 gap-y-1">
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
                        <div className="flex flex-col text-[#F3ECE7] text-[18px]">About Us</div>
                        <div className="flex flex-col text-base text-[#F3ECE7]/70 gap-y-1">
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
