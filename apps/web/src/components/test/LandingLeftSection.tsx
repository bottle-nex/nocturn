'use client';
import { cn } from '@/lib/utils';
import { fontAudio } from 'app/fonts/google_fonts';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GoArrowRight } from 'react-icons/go';

export function LandingLeftSection() {
    return (
        <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-6"
            >
                <div className="bg-black relative p-2 rounded-lg rotate-[-10deg] shadow-[4px_4px_0px_#000]">
                    <div className="h-4 w-4 relative">
                        <Image
                            src="/images/SOLANA.svg"
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                        />
                    </div>
                </div>
                <span className="font-black uppercase tracking-[0.2em] text-sm bg-eta/30 px-3 py-1 border-b-2 border-black">
                    Powered By SOLANA
                </span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                    'text-[clamp(4rem,10vw,8.5rem)] leading-[0.8] font-black uppercase tracking-tight mb-8',
                    fontAudio.className,
                )}
            >
                nocturn
                <span className="text-alpha italic drop-shadow-[4px_4px_0px_#000]">!</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl md:text-4xl font-bold text-zinc-800 leading-[1.1] mb-10 max-w-2xl"
            >
                Transforming <span className="text-alpha italic">curiosity</span> into a high-speed
                game. Learn anything,
                <span className="underline decoration-eta decoration-[12px] underline-offset-[-4px]">
                    {' '}
                    seriously fast.
                </span>
            </motion.p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <button className="group relative bg-black text-white px-10 py-6 text-2xl font-black uppercase rounded-[8px] hover:bg-alpha transition-all shadow-[0px_10px_0px_rgba(0,0,0,0.2)] active:translate-y-2">
                    Get Started
                    <GoArrowRight className="inline ml-3 -rotate-45 group-hover:rotate-0 group-hover:translate-x-2 transition-transform stroke-1" />
                </button>

                <div className="flex items-center">
                    <div className="flex -space-x-3">
                        {avatars.map((src, i) => (
                            <div
                                key={i}
                                className="relative w-12 h-12 rounded-full overflow-hidden border-4 border-white bg-zinc-200 shadow-[4px_4px_0px_#000] rotate-[-2deg] even:rotate-[2deg] hover:rotate-0 hover:scale-110 transition-all"
                            >
                                <Image
                                    src={src}
                                    alt={`player-${i}`}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                    priority={i < 2}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="pl-6 flex flex-col">
                        <span className="font-black text-lg leading-none">12k+</span>
                        <span className="text-xs font-bold text-zinc-500 uppercase">
                            Players Online
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const avatars = [
    'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg',
    'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg',
    'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg',
    'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg',
];
