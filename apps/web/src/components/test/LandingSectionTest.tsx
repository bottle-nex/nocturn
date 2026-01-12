'use client';
import { cn } from '@/lib/utils';
import { Roboto_Condensed } from 'next/font/google';
import Image from 'next/image';
import { FaStarOfLife } from 'react-icons/fa6';
import { GiPartyPopper } from 'react-icons/gi';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export const roboto = Roboto_Condensed({
    subsets: ['latin'],
    weight: ['300', '400', '500', '700', '900'],
    style: ['normal', 'italic'],
    display: 'swap',
    variable: '--font-roboto',
});

export default function LandingSectionTest() {
    const textRef = useRef<HTMLDivElement>(null);

    const isInView = useInView(textRef, {
        margin: '-120px 0px -120px 0px',
    });

    return (
        <div className="h-screen w-full bg-[#8DD362] flex justify-center relative overflow-hidden">
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
                    'h-[70%] text-[#2C2E2A] flex flex-col justify-center items-center max-w-[70%] w-full -space-y-6 z-10',
                )}
            >
                <div className="text-[12rem] flex flex-col items-center -space-y-33 tracking-tight font-semibold">
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
                    className="text-4xl tracking-[-0.020em]"
                >
                    Nocturn rewards certainity
                </motion.div>
            </motion.div>

            <div className="absolute -bottom-0 w-full mr-65 flex justify-center z-0">
                <div className="relative h-[500px] w-[1300px]">
                    <div className="absolute bottom-45 left-75">
                        <FaStarOfLife className="text-[#F54D25] size-8" />
                    </div>

                    <div className="absolute bottom-80 right-50 z-2">
                        <GiPartyPopper className="text-yellow-300 size-15" />
                    </div>

                    <div className="h-4 w-4 rounded-full absolute bottom-80 right-40 bg-blue-500" />

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
    );
}
