'use client';

import { motion, useInView } from 'framer-motion';
import { Button } from '../ui/button';
import { FiArrowUpRight } from 'react-icons/fi';
import { useRef } from 'react';

export default function FeaturesSection() {
    const topRef = useRef<HTMLDivElement>(null);

    const isTopInView = useInView(topRef, {
        margin: '-120px 0px -120px 0px',
    });

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-yellow-400 overflow-hidden">
            <motion.div
                ref={topRef}
                animate={isTopInView ? 'visible' : 'hidden'}
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.08,
                        },
                    },
                }}
                className="h-[30%] w-full max-w-[80%] flex flex-col justify-end text-7xl font-semibold gap-y-1.5 text-black"
            >
                <motion.span
                    variants={{
                        hidden: { opacity: 0, y: 70 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                stiffness: 340,
                                damping: 22,
                            },
                        },
                    }}
                >
                    Play, stake and earn SOLANA on
                </motion.span>

                <motion.span
                    variants={{
                        hidden: { opacity: 0, y: 70 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                stiffness: 340,
                                damping: 22,
                            },
                        },
                    }}
                >
                    Nocturn with no hassle
                </motion.span>

                {/* <motion.span
                    variants={{
                        hidden: { opacity: 0, y: 70 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                stiffness: 340,
                                damping: 22,
                            },
                        },
                    }}
                    className='text-2xl text-black mt-4'
                >
                    Nocturn does it all
                </motion.span> */}

                {/* <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 50 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                type: 'spring',
                                stiffness: 280,
                                damping: 20,
                                delay: 0.05,
                            },
                        },
                    }}
                    className="w-full flex justify-center gap-x-5 mt-5"
                >
                    <Button className="bg-white hover:bg-white text-tprime font-semibold h-14 px-5 border-2 border-tprime shadow-button">
                        CREATE QUIZ
                    </Button>

                    <Button className="bg-black hover:bg-black text-white font-semibold h-14 px-5 border-2 border-tprime shadow-button">
                        VIEW DOCS
                    </Button>
                </motion.div> */}
            </motion.div>

            <div className="h-[70%] w-full flex flex-col gap-y-7 mt-15 max-w-[80%] uppercase font-sans">
                <div className="flex gap-x-7">
                    <FeatureCard title="stake SOLANA" color="#FA798A" className="" />

                    {/* <FeatureCard
                        title="Create Quiz"
                        color="#E9CCFF"
                        className=""
                    /> */}
                    <FeatureCard title="publish drafts" color="#0A89FE" className="" />

                    <FeatureCard title="Audience poll" color="#8DD362" className="w-110" />
                </div>
                <div className="flex gap-x-7">
                    <FeatureCard title="sharable LINKS" color="#FF7050" className="" />
                    <FeatureCard title="& much more" color="white" className="" />
                </div>
            </div>
        </div>
    );
}

interface FeatureCardProps {
    title: string;
    color: string;
    className?: string;
}

function FeatureCard({ title, color, className = '' }: FeatureCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const isInView = useInView(cardRef, {
        margin: '-80px 0px -80px 0px',
        once: false,
    });

    return (
        <motion.div
            ref={cardRef}
            initial={{
                opacity: 0,
                y: 60,
                rotate: -4,
                scale: 0.92,
            }}
            animate={
                isInView
                    ? {
                          opacity: 1,
                          y: 0,
                          rotate: 0,
                          scale: 1,
                      }
                    : {
                          opacity: 0,
                          y: 60,
                          rotate: -4,
                          scale: 0.92,
                      }
            }
            transition={{
                type: 'spring',
                stiffness: 420,
                damping: 26,
                mass: 0.9,
            }}
            style={{
                backgroundColor: color,
                boxShadow: '8px 8px 0px rgba(0,0,0,1)',
            }}
            whileHover={{
                y: -4,
                rotate: 1,
                boxShadow: '10px 10px 0px rgba(0,0,0,1)',
            }}
            className={`min-h-40 w-100 rounded-3xl border-2 border-tprime py-6 px-6 flex flex-col justify-between tracking-tighter overflow-hidden shadow-xl cursor-pointer ${className}`}
        >
            <div className="font-bold italic text-7xl text-black">{title}</div>
        </motion.div>
    );
}
