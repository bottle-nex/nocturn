'use client';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';
import { LuSave } from 'react-icons/lu';
import { MdOutlineRocketLaunch, MdPublish } from 'react-icons/md';

const containerVariants = {
    initial: {
        transition: {
            staggerChildren: 0.18,
            staggerDirection: -1,
        },
    },
    hover: {
        transition: {
            staggerChildren: 0.18,
            staggerDirection: 1,
        },
    },
};

const avatarVariants: Variants = {
    initial: {
        scale: 0.75,
        opacity: 0,
        filter: 'blur(6px)',
    },
    hover: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

const charactersContainerVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.9,
        transition: {
            when: 'afterChildren',
        },
    },

    hover: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.22,
            ease: [0.22, 1, 0.36, 1],

            delayChildren: 0.12,
            staggerChildren: 0.07,
        },
    },
};

// const templates = [
//     {
//         id: 'MODERN',
//         name: 'MODERN',
//         backgroundColor: '#ff80ab',
//         textColor: '#000000',
//         borderColor: '#D1D5DB',
//         accentType: 'wave',
//         accentColor: '#EEEEEE',
//         bars: ['#196cff', '#ffd439', '#FF2929', '#0e6b45', '#1A73E8'],
//         src: 'pink-template',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//     },
//     {
//         id: 'NEON',
//         name: 'NEON',
//         backgroundColor: '#000000',
//         textColor: '#EEEEEE',
//         borderColor: '#000000',
//         accentType: 'staircase',
//         accentColor: '#EEEEEE',
//         bars: ['#FF6500', '#0A5EB0', '#FFE5CF', '#FFE700', '#7A1CAC'],
//         src: 'neon-template',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//     },
//     // {
//     //     id: "YELLOW",
//     //     name: "YELLOW",
//     //     backgroundColor: "#FFCC00",
//     //     textColor: "#000000",
//     //     borderColor: "#000000",
//     //     accentType: "circle",
//     //     accentColor: "#000000",
//     //     bars: ["#EB5B00", "#347433", "#C5172E", "#547792", "#F7CFD8"],
//     //     src: "yellow-template",
//     //     createdAt: new Date(),
//     //     updatedAt: new Date(),
//     // },
// ];

export function PublishCardContent(): React.JSX.Element {
    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            whileHover="hover"
            className={cn(
                'w-55 h-55 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl',
                'bg-light-alpha shrink-0 flex flex-col items-center gap-y-2',
                'relative overflow-hidden p-5 group select-none',
                // 'transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:-rotate-2',
            )}
        >
            <div
                className={cn(
                    'absolute h-13 w-44 top-6 select-none',
                    'ring-1 ring-black/10 shadow-sm shadow-black/5',
                    'rounded-[10px] flex items-center gap-x-2.5 px-2',
                    'bg-light-alpha z-1 blur-[1px]',
                    'transition-all transform duration-300 blur-none',
                    'group-hover:-translate-y- group-hover:z-0 group-hover:blur-[1px] group-hover:scale-75',
                )}
            >
                <div className="h-10 w-10 rounded-lg ring-1 ring-black/10 shadow-xs shadow-black/5 bg-light-base flex justify-center items-center text-neutral-500">
                    <MdOutlineRocketLaunch className="size-5" />
                </div>

                <div className="flex flex-col justify-between h-10">
                    <div className="text-sm text-dark-base/80">LAUNCH QUIZ</div>

                    <div className="text-[12px] text-dark-base/60">Live Action</div>
                </div>
            </div>

            <div
                className={cn(
                    'absolute h-13 w-44 top-20.5 select-none',
                    'ring-1 ring-black/10 shadow-sm shadow-black/5 rounded-[10px]',
                    'flex items-center gap-x-2.5 px-2 bg-light-alpha z-1',
                    'group-hover:-translate-y-6 group-hover:scale-85',
                    'transition-all transform duration-250',
                )}
            >
                <div className="h-10 w-10 rounded-lg ring-1 ring-black/10 shadow-xs shadow-black/5 bg-light-base flex justify-center items-center text-neutral-500">
                    <MdPublish className="size-5" />
                </div>

                <div className="flex flex-col justify-between h-10">
                    <div className="text-sm text-dark-base/80">PUBLISH QUIZ</div>

                    <div className="text-[12px] text-dark-base/60">Final Quiz</div>
                </div>
            </div>

            <div
                className={cn(
                    'absolute h-13 w-44 top-35',
                    'ring-1 ring-black/10 shadow-sm shadow-black/5 rounded-[10px]',
                    'flex items-center gap-x-2.5 px-2 bg-light-alpha z-2',
                    'group-hover:-translate-y-11.5 group-hover:scale-95 transition-all transform duration-300',
                )}
            >
                <div className="h-10 w-10 rounded-lg ring-1 ring-black/10 shadow-xs shadow-black/5 bg-light-base flex justify-center items-center text-neutral-500">
                    <LuSave className="size-5" />
                </div>

                <div className="flex flex-col justify-between h-10">
                    <div className="text-sm text-dark-base/80">SAVE DRAFT</div>

                    <div className="text-[12px] text-dark-base/60">Update changes</div>
                </div>
            </div>

            {/* characters */}
            <motion.div
                variants={charactersContainerVariants}
                className="relative top-33 flex items-center -space-x-3.5"
            >
                {/* <motion.div
                    variants={plusVariants}
                    className="h-6.5 w-6.5 ring-1 ring-black/10 shadow-sm shadow-black/10 rounded-full flex justify-center items-center z-5 bg-light-alpha white-btn"
                >
                    <GoPlus />
                </motion.div> */}

                <motion.div
                    variants={avatarVariants}
                    className="h-9 w-9 ring-1 ring-black/10 shadow-sm shadow-black/10 rounded-full relative overflow-hidden z-4"
                >
                    <Image
                        // src={'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg'}
                        src={'/images/landing/avatar1.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </motion.div>

                <motion.div
                    variants={avatarVariants}
                    className="h-9 w-9 ring-1 ring-black/10 shadow-sm shadow-black/10 rounded-full relative overflow-hidden z-3"
                >
                    <Image
                        src={'/images/landing/avatar2.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </motion.div>

                <motion.div
                    variants={avatarVariants}
                    className="h-9 w-9 ring-1 ring-black/10 shadow-sm shadow-black/10 rounded-full relative overflow-hidden z-2"
                >
                    <Image
                        src={'/images/landing/avatar3.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </motion.div>

                <motion.div
                    variants={avatarVariants}
                    className="h-9 w-9 ring-1 ring-black/10 shadow-sm shadow-black/10 rounded-full relative overflow-hidden z-1"
                >
                    <Image
                        src={'/images/landing/avatar4.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
