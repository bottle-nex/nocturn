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

export default function NocturnLandingSection() {
    const textRef = useRef<HTMLDivElement>(null);

    const isInView = useInView(textRef, {
        margin: '-120px 0px -120px 0px',
    });

    return (
        <section className="relative w-full bg-nprimary">
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
                        'h-[70%] text-ndarkest flex flex-col justify-center items-center max-w-[70%] w-full -space-y-2 z-10',
                    )}
                >
                    <div className="text-[9rem] flex flex-col items-center -space-y-22 tracking-tight font-semibold">
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
                        className="text-2xl tracking-wide text-ndarkest"
                    >
                        Nocturn rewards certainity
                    </motion.div>
                </motion.div>

                <div className="absolute -bottom-30 w-full flex justify-center z-0">
                    <div className="relative h-[600px] w-[900px]">
                        <Image
                            src="/images/hero2.png"
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
