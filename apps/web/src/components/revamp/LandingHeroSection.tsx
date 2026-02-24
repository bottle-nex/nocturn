'use client';
import { motion } from 'framer-motion';
import JoinQuizButton from '../test/JoinQuizButton';
import Image from 'next/image';
import { audio } from '../test/LandingFooter';
import { cn } from '@/lib/utils';

export default function LandingHeroSection() {
    return (
        <div className="min-h-screen h-full w-screen flex flex-col items-center mx-auto gap-y-5 relative">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 0',
                    maskImage: `
          repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
      `,
                    WebkitMaskImage: `
    repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
      `,
                    maskComposite: 'intersect',
                    WebkitMaskComposite: 'source-in',
                }}
            />
            <motion.div
                initial={{
                    scale: 0.8,
                    opacity: 0,
                }}
                animate={{
                    scale: 1,
                    opacity: 1,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5,
                }}
                className={cn(
                    'text-alpha/90 text-xl px-3 py-1 rounded-xs flex items-center gap-x-1 mt-[11%] z-10',
                    audio.className,
                )}
            >
                {/* <RiVipCrown2Line className="size-3.5" /> */}
                NOCTURN
            </motion.div>
            <div className="flex flex-col items-center text-dark-base text-6xl gap-y-1 font-semibold -mt-1 z-10">
                <div>The only quizzing platform</div>
                <div>where knowledge pays</div>
            </div>

            <div className="text-xl text-dark-base/60 max-w-[37rem] text-center">
                Nocturn is a live competitive quiz app designed for curious minds. Hosts launch
                challenges, players battle it out, and the top three win.
            </div>

            <div className="flex gap-x-10 mt-1">
                <JoinQuizButton />
            </div>

            <div className="h-[95vh] w-screen p-6">
                <div className="w-full h-full rounded-3xl bg-[#dddbff] overflow-hidden flex justify-center items-end shadow-xs shadow-black/5">
                    <div className="h-[90%] w-[76%] border border-white rounded-2xl relative overflow-hidden -mb-6">
                        <Image
                            src={'/images/image.png'}
                            alt=""
                            className="object-cover"
                            fill
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
