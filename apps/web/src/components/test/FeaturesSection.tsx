'use client';
import { motion, useScroll, useTransform, useMotionValue, useInView } from 'framer-motion';
import { Button } from '../ui/button';
import { FiArrowUpRight } from 'react-icons/fi';
import { useRef } from 'react';

export default function FeaturesSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);

    const isTopInView = useInView(topRef, {
        margin: '-120px 0px -120px 0px',
    });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });

    return (
        <div
            ref={containerRef}
            className="w-full h-screen flex flex-col items-center bg-[#F5F1E4] justify-between overflow-hidden"
        >
            <motion.div
                ref={topRef}
                style={{
                    y: useTransform(scrollYProgress, [0, 1], [0, -60]),
                }}
                animate={isTopInView ? 'visible' : 'hidden'}
                variants={{
                    hidden: {},
                    visible: {
                        transition: {
                            staggerChildren: 0.08,
                        },
                    },
                }}
                className="h-[40%] w-full flex flex-col justify-end items-center text-7xl font-semibold gap-y-1 text-black"
            >
                <motion.span
                    variants={{
                        hidden: { opacity: 0, y: 70, scale: 0.94 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
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
                        hidden: { opacity: 0, y: 70, scale: 0.94 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                                type: 'spring',
                                stiffness: 340,
                                damping: 22,
                            },
                        },
                    }}
                >
                    Nocturn — with no hassle
                </motion.span>

                <motion.div
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
                    <motion.div whileHover={{ scale: 1.07, rotate: -1 }} whileTap={{ scale: 0.96 }}>
                        <Button className="bg-white hover:bg-white text-tprime font-semibold h-14 px-5 border-2 border-tprime shadow-button">
                            CREATE QUIZ
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.07, rotate: 1 }} whileTap={{ scale: 0.96 }}>
                        <Button className="bg-black hover:bg-black text-white font-semibold h-14 px-5 border-2 border-tprime shadow-button">
                            VIEW DOCS
                        </Button>
                    </motion.div>
                </motion.div>
            </motion.div>

            <div className="h-[60%] w-full flex justify-between items-center px-10 uppercase font-sans">
                <FeatureCard
                    title="stake crypto"
                    desc="Turn curiosity into commitment with Solana staking."
                    color="#2AA0FE"
                    btnText="Try it out"
                    depth={40}
                    className="rotate-4"
                />

                <FeatureCard
                    title="Create Quiz"
                    desc="Choose your theme, enable interactions, add bonus points"
                    color="#E9CCFF"
                    btnText="HOST A QUIZ"
                    depth={70}
                    className="-rotate-5 mb-15"
                />

                <FeatureCard
                    title="Audience poll"
                    desc="When it matters most, rely on a lifeline."
                    color="#FFD731"
                    btnText="JOIN A QUIZ"
                    depth={30}
                    className="rotate-3"
                />

                <FeatureCard
                    title="save drafts"
                    desc="Create and save drafts, launch it later"
                    color="#FB4914"
                    btnText="START CREATING"
                    depth={90}
                    className="-rotate-5 mb-15"
                />
            </div>
        </div>
    );
}

interface FeatureCardProps {
    title: string;
    desc: string;
    color: string;
    btnText: string;
    depth: number;
    className?: string;
}

function FeatureCard({ title, desc, color, btnText, depth, className = '' }: FeatureCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const isInView = useInView(cardRef, {
        margin: '-100px 0px -100px 0px',
    });

    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ['start end', 'end start'],
    });

    const scrollY = useTransform(scrollYProgress, [0, 1], [depth, -depth]);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    return (
        <motion.div
            ref={cardRef}
            animate={
                isInView
                    ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
                    : { opacity: 0, y: 120, scale: 0.92, rotate: -2 }
            }
            transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            }}
            style={{
                backgroundColor: color,
                y: scrollY,
                x: mouseX,
                rotateX: mouseY,
                rotateY: mouseX,
                transformPerspective: 1200,
                boxShadow: '4px 4px 0px rgba(0,0,0,0.6)',
            }}
            whileHover={{
                scale: 1.03,
                boxShadow: '14px 14px 0px rgba(0,0,0,0.9)',
            }}
            className={`h-100 w-100 rounded-3xl border-2 border-tprime py-6 px-6 flex flex-col justify-between tracking-tighter overflow-hidden shadow-xl cursor-pointer ${className}`}
        >
            <div className="font-bold italic text-7xl text-black">{title}</div>

            <div className="w-full flex justify-end">
                <Button className="bg-white hover:bg-white shadow-button text-tprime font-semibold w-full h-12 flex items-center px-5 uppercase">
                    {btnText}
                    <FiArrowUpRight className="size-5 ml-2 stroke-2" />
                </Button>
            </div>

            <div className="font-semibold text-3xl tracking-tight text-black">{desc}</div>
        </motion.div>
    );
}
