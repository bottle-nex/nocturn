'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../ui/button';
import { IoIosArrowRoundForward } from 'react-icons/io';
import Image from 'next/image';

export default function SolanaPrizePool() {
    const sectionRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    // Slower, smoother fade — wide ramp in and out
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <>
            <motion.div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundColor: '#0c0c0c',
                    opacity,
                    zIndex: -1,
                }}
            />

            <motion.div ref={sectionRef} className="w-full text-light-base bg-transparent">
                <main className="w-full">
                    <section className="grid grid-cols-2 py-50 items-center">
                        <motion.div className="text-5xl max-w-xl mx-auto">
                            Turn your quizzes into live competitive showdowns
                        </motion.div>
                        <motion.div className="text-xl mx-auto max-w-xl text-light-base/70 tracking-wide flex justify-center items-center">
                            Nocturn is built to make quizzes interactive, competitive, and
                            rewarding. Create quizzes with AI, collaborate with others, and host
                            live games where participants compete and audiences engage through
                            lifelines and polls.
                        </motion.div>
                    </section>

                    <section className="grid w-full grid-cols-2 h-full">
                        <div className="bg-[#FFF9EB] h-170 relative overflow-hidden">
                            <Image
                                src="/images/landing/stakeSolana.png"
                                alt=""
                                width={1300}
                                height={800}
                                className="absolute -bottom-[8rem] -left-170 w-[1300px] max-w-none h-auto rounded-xl"
                                loading="lazy"
                                unoptimized
                            />
                        </div>
                        <div className="h-170 flex justify-center items-center">
                            <div className="flex flex-col gap-y-8 items-start w-md">
                                <div className="text-[#FFCE5D] text-xl">StakeX</div>
                                <div className="flex flex-col gap-y-3">
                                    <div className="text-4xl">
                                        Add stakes and reward top performers
                                    </div>
                                    <div className="text-light-base/60 text-[18px] tracking-wide">
                                        Bring real excitement into your quizzes by adding stakes
                                        with Solana and rewarding top performers, making every game
                                        more competitive, engaging, and rewarding.
                                    </div>
                                </div>
                                <Button className="flex gap-x-2 rounded-full bg-[#FFCE5D] hover:bg-[#FFCE5D] text-dark-alpha hover:-translate-y-0.5 transition-all transform duration-200 active:scale-[0.98] text-[18px] px-6! h-12 tracking-wide">
                                    <div className="font-normal">Host a quiz now</div>
                                    <IoIosArrowRoundForward className="size-6" />
                                </Button>
                            </div>
                        </div>
                    </section>

                    <section className="grid w-full grid-cols-2 h-full">
                        <div className="h-170 flex justify-center items-center">
                            <div className="flex flex-col gap-y-8 items-start w-md">
                                <div className="text-[#FFCE5D] text-xl">Genify</div>
                                <div className="flex flex-col gap-y-3">
                                    <div className="text-4xl text-light-base">
                                        Generate quiz questions instantly with AI
                                    </div>
                                    <div className="text-light-base/60 text-[18px] tracking-wide">
                                        Turn a simple idea or topic into a complete quiz in seconds
                                        using AI, then fine-tune questions, difficulty, and
                                        structure to perfectly match your needs.
                                    </div>
                                </div>
                                <Button className="flex gap-x-2 rounded-full bg-[#FFCE5D] text-dark-alpha hover:bg-[#FFCE5D] hover:-translate-y-0.5 transition-all transform duration-200 active:scale-[0.98] text-[18px] px-6! h-12 tracking-wide">
                                    <div className="font-normal">Generate with AI</div>
                                    <IoIosArrowRoundForward className="size-6" />
                                </Button>
                            </div>
                        </div>
                        <div className="bg-[#FFCE5D] h-170 relative overflow-hidden">
                            <Image
                                src="/images/landing/chatWithAi.png"
                                alt=""
                                width={1300}
                                height={800}
                                className="absolute -bottom-[8rem] -right-170 w-[1300px] max-w-none h-auto rounded-xl"
                                loading="lazy"
                                unoptimized
                            />
                        </div>
                    </section>
                </main>
            </motion.div>
        </>
    );
}
