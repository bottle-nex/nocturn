'use client';
import { cn } from '@/lib/utils';
import { Roboto_Condensed } from 'next/font/google';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export const roboto = Roboto_Condensed({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700', '900'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-roboto',
});

export function LandingSectionTest() {
    const textRef = useRef<HTMLDivElement>(null);

    const isInView = useInView(textRef, {
        margin: '-120px 0px -120px 0px',
    });

    return (
        <section className="relative h-[200vh] w-full bg-[#8DD362]">
            <div className="sticky top-0 h-screen w-full flex justify-center overflow-hidden">
                <motion.div
                    ref={textRef}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                            },
                        },
                    }}
                    className={cn(
                        'h-[70%] text-[#2C2E2A] flex flex-col justify-center items-center max-w-[70%] w-full -space-y-3 z-10',
                    )}
                >
                    <div className="text-[9rem] flex flex-col items-center -space-y-20 tracking-tight font-semibold">
                        <motion.span
                            variants={{
                                hidden: { opacity: 0, y: 90, scale: 0.93 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 380,
                                        damping: 24,
                                    },
                                },
                            }}
                        >
                            Proof over
                        </motion.span>

                        <motion.span
                            variants={{
                                hidden: { opacity: 0, y: 90, scale: 0.93 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 380,
                                        damping: 24,
                                    },
                                },
                            }}
                        >
                            opinion
                        </motion.span>
                    </div>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 60 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 22,
                                    delay: 0.05,
                                },
                            },
                        }}
                        className="text-2xl tracking-[-0.020em]"
                    >
                        Nocturn rewards certainity
                    </motion.div>
                </motion.div>

                <div className="absolute bottom-0 w-full mr-65 flex justify-center z-0">
                    <div className="relative h-[300px] w-[1300px]">
                        <Image
                            src="/images/hero.png"
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
