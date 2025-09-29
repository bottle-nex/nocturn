import Image from 'next/image';
import { HoverBorderGradient } from '../ui/HoverBorderGradient';
import AnimatedSvgCircles from '../ui/AnimatedSvgCircles';
import SafariBrowser from '../ui/SafariBrowser';
import { Highlighter } from '../ui/Highlighter';
import { DiOpensource } from 'react-icons/di';
import { MdOutlineArrowRightAlt } from 'react-icons/md';
import { ShinyButton } from '../magicui/shiny-button';
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="w-full relative">
            <div className="flex flex-col mx-auto items-center justify-center w-full max-w-4xl px-4 py-8 text-center relative z-10 select-none">
                <div className="absolute bottom-0 -z-10">
                    <AnimatedSvgCircles />
                </div>
                <HoverBorderGradient
                    containerClassName="rounded-full"
                    as="button"
                    className="dark:bg-black bg-white text-black dark:text-white flex items-center space-x-2"
                >
                    <Image
                        src={'/images/solana-logo.png'}
                        width={25}
                        height={25}
                        alt="solana"
                        className="rounded-full"
                    />
                    <span className="text-sm">powered by solana</span>
                </HoverBorderGradient>
                <div className="bg-neutral-950 h-[30px] " />
                <h1
                    className="text-7xl font-semibold text-transparent bg-clip-text tracking-tight
                        bg-gradient-to-b
                        from-black/60 via-black/80 to-black 
                        dark:from-white/20 dark:via-light-base/50 dark:to-white/80"
                >
                    Stake. Quiz. Compete
                    <br />
                    Win in crypto
                </h1>
                <div className="text-md font-normal dark:text-neutral-400 text-neutral-600 text-wrap max-w-[70%] mt-4">
                    A decentralized,{' '}
                    <Highlighter
                        className="dark:text-light-base text-neutral-300"
                        color="#4f2b82"
                        action="highlight"
                    >
                        gamified quiz platform{' '}
                    </Highlighter>{' '}
                    where hosts stake crypto, compete in live quiz challenges, and earn{' '}
                    <Highlighter color="#FF9800" action="underline">
                        rewards for their knowledge
                    </Highlighter>{' '}
                    .
                </div>
                <div className="flex items-center justify-center gap-x-4 mt-8">
                    <Link
                        href={'https://github.com/celestium-x/triangulum-x/'}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ShinyButton className="text-[13px] bg-[#4f2b82] rounded-full px-4 py-[7px] flex items-center justify-center gap-x-1 cursor-pointer !text-light-base dark">
                            <DiOpensource className="size-5" />
                            we are open source
                        </ShinyButton>
                    </Link>
                    <div
                        className="text-[13px] 
                        border border-neutral-700 dark:border-neutral-400
                      dark:bg-neutral-200 bg-neutral-900 
                        rounded-full px-4 py-[7px] 
                        flex items-center justify-center gap-x-1 
                      dark:text-dark-primary text-light-base 
                        group cursor-pointer
                        shadow-[inset_0_2px_4px_rgba(255,255,255,0.25)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]"
                    >
                        start creating quiz
                        <MdOutlineArrowRightAlt className="group-hover:translate-x-1 transform transition-transform ease-in" />
                    </div>
                </div>
            </div>

            <SafariBrowser
                url="https://triangulum.com"
                imageSrc="/images/dashboard-ui2.png"
                className="w-[100px] h-auto mx-auto z-40 relative"
            />
        </div>
    );
}
