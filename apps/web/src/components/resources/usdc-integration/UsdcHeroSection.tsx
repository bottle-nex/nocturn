'use client';
import { motion, animate, useInView } from 'framer-motion';
import { audio } from '@/components/test/LandingFooter';
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function UsdcHeroSection() {
    const bannerRef = useRef<HTMLDivElement>(null);
    const shineRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(bannerRef, { once: true, margin: '-100px' });

    useEffect(() => {
        if (!isInView || !shineRef.current) return;

        const timeout = setTimeout(() => {
            animate(
                shineRef.current!,
                { left: '210%', top: '210%' },
                { duration: 1.2, ease: 'easeInOut' },
            );
        }, 600);

        return () => clearTimeout(timeout);
    }, [isInView]);

    return (
        <div className="w-full max-w-270 flex flex-col pt-32 mx-auto px-5">
            <motion.div
                ref={bannerRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
                className="mt-10 w-full h-130 rounded-2xl bg-linear-to-b from-neutral-800 via-neutral-900 to-black/90 flex items-center justify-center relative overflow-hidden"
            >
                <div
                    ref={shineRef}
                    className={cn(
                        'absolute -rotate-45 pointer-events-none',
                        'bg-[linear-gradient(115deg,transparent_10%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.06)_40%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.06)_60%,rgba(255,255,255,0.02)_75%,transparent_90%)]',
                        'blur-[2px]',
                    )}
                    style={{
                        width: '160%',
                        aspectRatio: '16/9',
                        top: '-160%',
                        left: '-160%',
                    }}
                />

                <div className="flex items-center gap-x-5 relative z-10">
                    <span className={`text-light-base text-7xl font-semibold ${audio.className}`}>
                        nocturn
                    </span>
                    <span className="text-light-base/30 text-5xl font-normal">
                        x
                    </span>
                    <span className="text-light-base text-7xl font-semibold">
                        USDC
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
