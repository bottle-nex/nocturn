'use client';
import Image from 'next/image';
import { FaThumbsUp } from 'react-icons/fa6';
import { IoIosPeople } from 'react-icons/io';
import VoiceIcon from '../ui/svg/VoiceIcon';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AnimatedIcons from '../revamp/AnimatedIcons';
import AnimatedClock from '../ui/animated-icons/AnimatedClock';
import { SiSolana } from 'react-icons/si';
import SectionHeading from '../ui/SectionHeading';
import { BiCool } from 'react-icons/bi';
export default function FeaturesSection() {
    const [showCollabPanel, setShowCollabPanel] = useState<boolean>(false);
    const [showInteractionsPanel, setShowInteractionsPanel] = useState<boolean>(false);
    const [showQuizTheme, setShowQuizTheme] = useState<boolean>(false);
    const [showAIWords, setShowAIWords] = useState<boolean>(false);
    const [showAudiencePoll, setShowAudiencePoll] = useState<boolean>(false);
    const [audienceBarHeights, setAudienceBarHeights] = useState<number[]>([]);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    type Particle = {
        id: number;
        x: number;
        y: number;
        size: number;
        color: string;
        rotate: number;
        duration: number;
        isIcon: boolean;
    };

    const PARTICLE_COUNT = 30;
    const COLORS = ['#ff6b6b', '#ffd93d', '#6bcBef', '#b983ff', '#4cd137', '#ff9f43'];

    const generateParticles = (): Particle[] => {
        return Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
            const spread = (Math.random() - 0.5) * 180;
            const height = -Math.random() * 40 - 30;

            return {
                id: i + Math.random(),
                x: spread,
                y: height,
                size: Math.random() * 10 + 2,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                rotate: Math.random() * 360,
                duration: Math.random() * 0.7 + 1.2,
                isIcon: Math.random() > 0.65,
            };
        });
    };
    useEffect(() => {
        if (!showAudiencePoll) {
            setAudienceBarHeights([10, 10, 10, 10]);
            return;
        }

        setAudienceBarHeights([
            Math.random() * 60 + 20,
            Math.random() * 60 + 20,
            Math.random() * 60 + 20,
            Math.random() * 60 + 20,
        ]);

        const interval = setInterval(() => {
            setAudienceBarHeights([
                Math.random() * 60 + 20,
                Math.random() * 60 + 20,
                Math.random() * 60 + 20,
                Math.random() * 60 + 20,
            ]);
        }, 1600);

        return () => clearInterval(interval);
    }, [showAudiencePoll]);

    const aiWords = ['create', 'a', 'quiz', 'for', 'me'];
    const dots = [
        { id: 1, color: '#ff80ab', name: 'MODERN' },
        { id: 2, color: '#FFCC00', name: 'YELLOW' },
        { id: 3, color: '#196aff', name: 'BLUE' },
    ];

    const avatars = [
        {
            src: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg',
            x: -50,
            y: 0,
            delay: 0,
        },
        {
            src: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg',
            x: -10,
            y: -5,
            delay: 0.05,
        },
        {
            src: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg',
            x: 30,
            y: 0,
            delay: 0.1,
        },
    ];

    return (
        <div className="w-screen min-h-screen h-full bg-white flex flex-col justify-center items-center relative overflow-hidden pt-20 select-none">
            <SectionHeading
                title="Features that shine"
                description="Create engaging live quizzes with real-time multiplayer experiences, collaborate with your team on quiz content, and publish to your audience. From creation to launch, manage every aspect of your quiz seamlessly."
                icon={<BiCool className="size-4" />}
                ticker="acknowledge us"
            />
            <div className="max-h-screen w-full h-full flex flex-col items-center justify-center pt-30">
                <div className="w-320 h-320 aspect-square border border-dark-base/1 flex justify-center items-center rounded-[21rem] shadow-xs -mt-50 ">
                    <div className="w-290 h-290 aspect-square border border-dark-base/2 flex justify-center items-center rounded-[19rem] shadow-xs">
                        <div className="w-260 h-260 aspect-square border border-dark-base/3 flex justify-center items-center rounded-[17rem] shadow-xs">
                            <div className="w-230 h-230 aspect-square border border-dark-base/4 flex justify-center items-center rounded-[15rem] shadow-xs">
                                <div className="w-200 h-200 aspect-square border border-dark-base/5 flex justify-center items-center rounded-[13rem] shadow-xs">
                                    <div className="w-170 h-170 aspect-square border border-dark-base/10 flex justify-center items-center rounded-[11rem] shadow-xs">
                                        <div className="w-140 h-140 aspect-square border border-dark-base/15 flex justify-center items-center rounded-[9rem] shadow-xs">
                                            <div className="w-110 h-110 aspect-square border border-dark-base/20 flex justify-center items-center rounded-[7rem] shadow-xs">
                                                <div className="w-80 h-80 aspect-square border border-dark-base/25 flex justify-center items-center rounded-[5rem] relative shadow-xs">
                                                    <div className="-left-74 -top-12 absolute select-none">
                                                        <AnimatePresence>
                                                            {isHovered &&
                                                                particles.map((p) => (
                                                                    <motion.div
                                                                        key={p.id}
                                                                        initial={{
                                                                            x: 0,
                                                                            y: -10,
                                                                            opacity: 1,
                                                                            scale: 0.6,
                                                                        }}
                                                                        animate={{
                                                                            x: [0, p.x * 0.7, p.x],
                                                                            y: [0, p.y * 0.5, p.y],
                                                                            opacity: [1, 1, 0],
                                                                            rotate: p.rotate,
                                                                            scale: [0.6, 1.2, 0.9],
                                                                        }}
                                                                        transition={{
                                                                            duration: p.duration,
                                                                            ease: [
                                                                                0.22, 1, 0.36, 1,
                                                                            ],
                                                                        }}
                                                                        className="absolute pointer-events-none"
                                                                        style={{
                                                                            width: p.size,
                                                                            height: p.size,
                                                                            left: `calc(50% + ${p.x}px)`,
                                                                            top: `calc(50% + ${p.y}px)`,
                                                                            transform:
                                                                                'translate(-50%, -50%)',
                                                                        }}
                                                                    >
                                                                        {p.isIcon ? (
                                                                            <SiSolana
                                                                                size={p.size * 1.2}
                                                                                style={{
                                                                                    color: p.color,
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    width: '100%',
                                                                                    height: '100%',
                                                                                    background:
                                                                                        p.color,
                                                                                    borderRadius:
                                                                                        Math.random() >
                                                                                        0.5
                                                                                            ? 2
                                                                                            : 999,
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </motion.div>
                                                                ))}
                                                        </AnimatePresence>

                                                        <motion.div
                                                            onHoverStart={() => {
                                                                setIsHovered(true);
                                                                setParticles(generateParticles());
                                                            }}
                                                            onHoverEnd={() => setIsHovered(false)}
                                                            animate={{
                                                                scale: isHovered ? 1.08 : 1,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 380,
                                                                damping: 14,
                                                            }}
                                                            className="relative h-15 w-53 rounded-xl bg-white ring-1 ring-black/10 shadow-md flex items-center justify-center gap-x-3 z-10"
                                                        >
                                                            <motion.div
                                                                className="w-8.5 h-8.5 rounded-full relative overflow-hidden ring-1 ring-black/10 bg-black flex items-center justify-center z-10"
                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0.9,
                                                                    filter: 'blur(4px)',
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    scale: 1,
                                                                    filter: 'blur(0px)',
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    scale: 0.9,
                                                                    filter: 'blur(4px)',
                                                                }}
                                                                transition={{ duration: 0.35 }}
                                                            >
                                                                <Image
                                                                    src="/images/SOLANA.svg"
                                                                    alt="logo"
                                                                    fill
                                                                    className="object-contain p-2"
                                                                />
                                                            </motion.div>

                                                            <div className="flex flex-col -space-y-1 text-dark-base text-xl z-10">
                                                                <div>Solana staking</div>
                                                                <div className="text-xs text-black/50 tracking-wide">
                                                                    EASY MONEY
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    <div
                                                        onMouseEnter={() => setShowAIWords(true)}
                                                        onMouseLeave={() => setShowAIWords(false)}
                                                        className="absolute -left-107 top-60 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 w-70 h-15 text-xl rounded-xl bg-light-alpha flex items-center justify-center gap-x-3 overflow-visible z-5 group select-none"
                                                    >
                                                        <div className="w-8.5 h-8.5 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden ring-1 ring-black/10 shadow-md shadow-black/5">
                                                            <VoiceIcon
                                                                size={25}
                                                                className="text-dark-base group-hover:text-red-500 pr-px transition-colors transform duration-300"
                                                                animate
                                                            />
                                                        </div>
                                                        <div className="flex flex-col -space-y-[2px]">
                                                            <div>AI-powered generation</div>
                                                            <div className="text-xs text-dark-base/50 tracking-wide">
                                                                YOU CAN PROCASTINATE
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <AnimatePresence>
                                                        {showAIWords && (
                                                            <div className="absolute -left-93 top-50 flex gap-x-2.5 pointer-events-none z-0">
                                                                {aiWords.map((word, i) => (
                                                                    <motion.span
                                                                        key={word}
                                                                        className="text-base font-medium text-dark-base whitespace-nowrap"
                                                                        initial={{
                                                                            opacity: 0,
                                                                            y: 30,
                                                                            scale: 0.95,
                                                                            filter: 'blur(4px)',
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            y: 0,
                                                                            scale: 1.1,
                                                                            filter: 'blur(0px)',
                                                                        }}
                                                                        exit={{
                                                                            opacity: 0,
                                                                            y: 30,
                                                                            scale: 0.7,
                                                                            filter: 'blur(4px)',
                                                                        }}
                                                                        transition={{
                                                                            duration: 0.5,
                                                                            ease: [
                                                                                0.22, 1, 0.36, 1,
                                                                            ],
                                                                            delay: i * 0.05,
                                                                        }}
                                                                    >
                                                                        {word}
                                                                    </motion.span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </AnimatePresence>

                                                    {showAudiencePoll && (
                                                        <motion.div className="absolute -right-70 -top-24 h-20 w-50 rounded-xl flex justify-end items-end px-3">
                                                            <div className="flex gap-x-3 w-full h-full px-1.5 items-end relative mt-5">
                                                                <motion.div
                                                                    className="w-full border border-dark-faded -rotate-1 rounded-t-alpha bg-[#E2C275]"
                                                                    animate={{
                                                                        height: `${audienceBarHeights[0] || 5}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.6,
                                                                        ease: 'easeInOut',
                                                                    }}
                                                                />

                                                                <motion.div
                                                                    className="w-full border border-dark-faded rotate-2 rounded-t-alpha bg-[#6886C5]"
                                                                    animate={{
                                                                        height: `${audienceBarHeights[1] || 5}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.6,
                                                                        ease: 'easeInOut',
                                                                    }}
                                                                />

                                                                <motion.div
                                                                    className="w-full border border-dark-faded rounded-t-alpha bg-[#CD5656]"
                                                                    animate={{
                                                                        height: `${audienceBarHeights[2] || 5}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.6,
                                                                        ease: 'easeInOut',
                                                                    }}
                                                                />

                                                                <motion.div
                                                                    className="w-full border border-dark-faded rounded-t-alpha bg-[#AEDADD] rotate-2"
                                                                    animate={{
                                                                        height: `${audienceBarHeights[3] || 5}%`,
                                                                    }}
                                                                    transition={{
                                                                        duration: 0.6,
                                                                        ease: 'easeInOut',
                                                                    }}
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}

                                                    <div
                                                        onMouseEnter={() =>
                                                            setShowAudiencePoll(true)
                                                        }
                                                        onMouseLeave={() =>
                                                            setShowAudiencePoll(false)
                                                        }
                                                        className="absolute -right-70 -top-5 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 rounded-xl w-50 h-14 text-xl bg-light-alpha flex items-center justify-center gap-x-3 hover:scale-105 transition-all transform duration-200 select-none"
                                                    >
                                                        <div className="w-8.5 h-8.5 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden ring-1 ring-[#DD3123] shadow-md shadow-black/5 bg-[#DD312330]">
                                                            <AnimatedClock
                                                                className="p-0.75"
                                                                autoAnimate={
                                                                    showAudiencePoll && true
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex flex-col -space-y-1.5">
                                                            <div>Audience Poll</div>
                                                            <div className="text-xs text-dark-base/50 tracking-wide">
                                                                LIFE SAVERS
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {showQuizTheme && (
                                                            <div className="absolute -right-110 top-20 flex gap-x-2 pointer-events-none z-10">
                                                                {dots.map((dot, i) => (
                                                                    <motion.div
                                                                        key={dot.id}
                                                                        layoutId={`theme-dot-${dot.id}`}
                                                                        className="h-7 w-18 rounded-md flex justify-center items-center text-xs text-dark-base font-semibold"
                                                                        style={{
                                                                            backgroundColor:
                                                                                dot.color,
                                                                        }}
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                        transition={{
                                                                            type: 'spring',
                                                                            stiffness: 500,
                                                                            damping: 30,
                                                                            delay: i * 0.09,
                                                                        }}
                                                                    >
                                                                        {dot.name}
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div
                                                        onMouseEnter={() => setShowQuizTheme(true)}
                                                        onMouseLeave={() => setShowQuizTheme(false)}
                                                        className="absolute -right-110 top-30 w-57 h-15 rounded-xl bg-light-alpha ring-1 ring-black/10 shadow-md flex items-center gap-x-3 px-6 select-none"
                                                    >
                                                        <div className="flex -space-x-1.5">
                                                            {dots.map((dot) => (
                                                                <motion.div
                                                                    key={dot.id}
                                                                    layoutId={`theme-dot-${dot.id}`}
                                                                    className="h-5 w-5 rounded-full"
                                                                    style={{
                                                                        backgroundColor: dot.color,
                                                                    }}
                                                                    transition={{
                                                                        type: 'spring',
                                                                        stiffness: 500,
                                                                        damping: 35,
                                                                    }}
                                                                />
                                                            ))}
                                                        </div>

                                                        <div className="flex flex-col -space-y-1.5 text-dark-base text-xl">
                                                            <div>Quiz Themes</div>
                                                            <div className="text-xs text-dark-base/50 tracking-wide">
                                                                CHOOSE YOUR VIBE
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div
                                                        className="absolute -right-0 -bottom-37 w-46 h-14"
                                                        style={{ perspective: 1000 }}
                                                        onMouseEnter={() =>
                                                            setShowInteractionsPanel(true)
                                                        }
                                                        onMouseLeave={() =>
                                                            setShowInteractionsPanel(false)
                                                        }
                                                    >
                                                        <motion.div
                                                            className="relative w-full h-full"
                                                            animate={{
                                                                rotateX: showInteractionsPanel
                                                                    ? 180
                                                                    : 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.6,
                                                                ease: [0.23, 1, 0.32, 1],
                                                            }}
                                                            style={{
                                                                transformStyle: 'preserve-3d',
                                                            }}
                                                        >
                                                            <div
                                                                className="absolute inset-0 backface-hidden text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 rounded-xl bg-light-alpha flex items-center justify-center gap-x-3"
                                                                style={{
                                                                    backfaceVisibility: 'hidden',
                                                                }}
                                                            >
                                                                <div className="w-8.5 h-8.5 flex justify-center items-center rounded-full ring-1 ring-[#FEC41E] bg-[#FEC41E30]">
                                                                    <FaThumbsUp className="text-[#ffac11] size-5" />
                                                                </div>
                                                                <div className="flex flex-col -space-y-1.5">
                                                                    <div>Interactions</div>
                                                                    <div className="text-xs text-dark-base/50 tracking-wide">
                                                                        KEEP IT FUN
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div
                                                                className="absolute inset-0 backface-hidden rounded-xl bg-light-alpha ring-1 ring-black/10 shadow-md flex items-center justify-center"
                                                                style={{
                                                                    transform: 'rotateX(180deg)',
                                                                    backfaceVisibility: 'hidden',
                                                                }}
                                                            >
                                                                <AnimatedIcons />
                                                            </div>
                                                        </motion.div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {showCollabPanel && (
                                                            <motion.div
                                                                className="absolute left-1/2 -translate-x-1/2 -top-47 pointer-events-none"
                                                                initial={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                            >
                                                                {avatars.map((avatar, i) => (
                                                                    <motion.div
                                                                        key={i}
                                                                        className="absolute w-8 h-8 rounded-full overflow-hidden shadow-md shadow-black/10"
                                                                        initial={{
                                                                            x: 0,
                                                                            y: 0,
                                                                            scale: 0,
                                                                            opacity: 0,
                                                                        }}
                                                                        animate={{
                                                                            x: avatar.x,
                                                                            y: avatar.y,
                                                                            scale: 1,
                                                                            opacity: 1,
                                                                        }}
                                                                        exit={{
                                                                            x: 0,
                                                                            y: 0,
                                                                            scale: 0,
                                                                            opacity: 0,
                                                                        }}
                                                                        transition={{
                                                                            type: 'spring',
                                                                            stiffness: 500,
                                                                            damping: 28,
                                                                            delay: avatar.delay,
                                                                        }}
                                                                    >
                                                                        <Image
                                                                            src={avatar.src}
                                                                            alt="avatar"
                                                                            fill
                                                                            unoptimized
                                                                            className="object-cover"
                                                                        />
                                                                    </motion.div>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    <div
                                                        onMouseEnter={() =>
                                                            setShowCollabPanel(true)
                                                        }
                                                        onMouseLeave={() =>
                                                            setShowCollabPanel(false)
                                                        }
                                                        className="absolute left-1/2 -translate-x-1/2 -top-37 w-50 h-15 rounded-xl bg-light-alpha ring-1 ring-black/10 shadow-md shadow-black/5 flex items-center justify-center gap-x-3 text-xl select-none"
                                                    >
                                                        <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-alpha/30 ring-1 ring-alpha">
                                                            <IoIosPeople className="text-alpha size-5.5" />
                                                        </div>

                                                        <div className="flex flex-col -space-y-1.5 text-dark-base">
                                                            <div>Collaborators</div>
                                                            <div className="text-xs text-dark-base/50 tracking-wide">
                                                                BUILD IN TEAM
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="absolute ">
                                                        <div className="relative h-15 w-15 -top-32 right-0 z-20 rotate-53">
                                                            <Image
                                                                src={'/illustrations/lines_in.png'}
                                                                alt=""
                                                                fill
                                                                unoptimized
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="w-50 h-50 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden bg-dark-base ring-1 ring-black/10 shadow-md shadow-black/5">
                                                        <Image
                                                            src="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg"
                                                            alt="logo"
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
