'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';
import { LuSave } from 'react-icons/lu';
import { MdOutlineRocketLaunch, MdPublish } from 'react-icons/md';
import { GoPlus } from 'react-icons/go';

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
                'relative overflow-hidden p-5 group',
                // 'transition-all duration-300 hover:-translate-y-1.5 hover:scale-105 hover:-rotate-2',
            )}
        >
            <div
                className={cn(
                    'absolute h-13 w-44 top-8 select-none',
                    'ring-1 ring-black/10 shadow-sm shadow-black/5',
                    'rounded-[10px] flex items-center gap-x-2.5 px-2',
                    'bg-light-alpha z-1 scale-80 blur-[1px]',
                    'group-hover:blur-none group-hover:z-2 group-hover:-translate-y-2.75 transition-all transform duration-250',
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
                    'absolute h-13 w-44 top-17 select-none',
                    'ring-1 ring-black/10 shadow-sm shadow-black/5 rounded-[10px]',
                    'flex items-center gap-x-2.5 px-2 bg-light-alpha z-1 scale-90',
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

            <div className="absolute h-13 w-44 top-26 ring-1 ring-black/10 shadow-sm shadow-black/5 rounded-[10px] flex items-center gap-x-2.5 px-2 bg-light-alpha z-2 group-hover:translate-y-4 transition-all transform duration-250 select-none">
                <div className="h-10 w-10 rounded-lg ring-1 ring-black/10 shadow-xs shadow-black/5 bg-light-base flex justify-center items-center text-neutral-500">
                    <LuSave className="size-5" />
                </div>

                <div className="flex flex-col justify-between h-10">
                    <div className="text-sm text-dark-base/80">SAVE DRAFT</div>

                    <div className="text-[12px] text-dark-base/60">Update changes</div>
                </div>
            </div>

            <div className="relative top-37 flex items-center -space-x-1 group-hover:scale-0 opacity:100 group-hover:opacity-0 transition-all transform duration-250 select-none">
                <div className="h-6 w-6 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full flex justify-center items-center z-5 bg-light-alpha">
                    <GoPlus />
                </div>
                <div className="h-6 w-6 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full relative overflow-hidden z-4">
                    <Image
                        src={'/images/landing/avatar1.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
                <div className="h-6 w-6 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full relative overflow-hidden z-3">
                    <Image
                        src={'/images/landing/avatar2.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
                <div className="h-6 w-6 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full relative overflow-hidden z-2">
                    <Image
                        src={'/images/landing/avatar3.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
                <div className="h-6 w-6 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full relative overflow-hidden z-1">
                    <Image
                        src={'/images/landing/avatar5.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
            </div>

            {/* <div className="w-full h-fit text-[13px] text-dark-base/80 flex gap-x-2">
                <div className="h-fit w-fit px-2.5 py-1.5 rounded-lg ring-2 ring-light-base/70 shadow-sm shadow-black/20 flex items-center gap-x-1 bg-linear-to-br from-dark-base/10 via-light-base to-light-alpha">
                    <RiGeminiFill/>
                    Ask AI
                </div>
                <div className="h-fit w-fit pl-2.25 pr-2.5 py-1.5 rounded-lg ring-2 ring-light-base/70 shadow-sm shadow-black/20 flex items-center gap-x-1.5 bg-white">
                    <Image
                        src={'/images/landing/avatar2.png'}
                        alt=""
                        width={20}
                        height={20}
                        unoptimized
                        className="ring-1 ring-black/5 shadow-xs shadow-black/10 rounded-full"
                    />
                    <span>
                        Kirat
                    </span>
                    <div className="">
                        <IoClose className="text-neutral-600" strokeWidth={3}/>
                    </div>
                </div>
            </div>

            <motion.div
                className="h-fit py-1.5 w-34 bg-light-base ring-1 ring-black/5 shadow-sm shadow-black/10 rounded-xl flex gap-x-2 justify-end items-center px-2 text-dark-base/80 z-3 bg-light-alpha/40 backdrop-blur-xs ml-10"
            >
                <div className="h-7 w-7 flex justify-center items-center">
                    <Bold className="size-3.5" />
                </div>
                <div className="h-7 w-7 rounded-lg ring-1 ring-neutral-200 bg-light-alpha shadow-sm shadow-black/20 flex justify-center items-center shrink-0">
                    <Italic className="size-3.5" />
                </div>
                <div className="h-7 w-7 flex justify-center items-center">
                    <UnderlineIcon className="size-3.5" />
                </div>
                <div className="h-7 w-7 flex justify-center items-center">
                    <Strikethrough className="size-3.5" />
                </div>
            </motion.div> */}

            {/* <div className="h-8 w-fit px-2.5 py-1.5 ring-2 ring-light-base/70 shadow-sm shadow-black/20 text-blue-600/80 text-[13px] flex items-center gap-x-1.5 rounded-lg">
                <IoWalletOutline/>
                Connect Wallet
            </div> */}

            {/* <div className="flex ring-1 ring-black/5 shadow-sm shadow-black/10 rounded-xl p-1.5 w-40.5 justify-between -rotate-2 left-7 top-17 absolute">
                {templates.map((template) => {
                    return (
                        <div
                            key={template.id}
                            className="rounded-[9px] cursor-pointer opacity-90"
                        >
                            <ThemePreview
                                showText
                                className={cn(
                                    ' h-12 w-18',
                                )}
                                template={template}
                            />
                        </div>
                    );
                })}
            </div>

                <motion.div
                    className="absolute top-14 left-4 text-[11px] text-dark-base/80 bg-light-alpha px-2.5 py-0.5 ring-1 ring-black/10 shadow-sm shadow-black/5 rounded-full tracking-wide -rotate-4"
                >
                    SAVE
                </motion.div>

                <motion.div
                    className="absolute top-12 left-15 text-[11px] text-dark-base/80 bg-light-alpha px-2.5 py-0.5 ring-1 ring-black/10 shadow-sm shadow-black/5 rounded-full tracking-wide rotate-4"
                >
                    PUBLISH
                </motion.div>


                <motion.div
                    className="absolute top-30 left-32 text-[11px] text-dark-base/80 bg-light-alpha px-2.5 py-0.5 ring-1 ring-black/10 shadow-sm shadow-black/5 rounded-full tracking-wide -rotate-4"
                >
                   LAUNCH 
                </motion.div> */}

            {/* <motion.div
                className="h-10 w-48 ring-1 ring-black/5 shadow-sm shadow-black/10 rounded-xl absolute -left-10 top-10 flex gap-x-2 justify-end items-center px-2 text-dark-base/90"
            >
                <div className="h-7 w-7 flex justify-center items-center">
                    <Bold className="size-3.75" />
                </div>
                <div className="h-7 w-7 rounded-lg ring-1 ring-neutral-200 shadow-sm shadow-black/20 flex justify-center items-center">
                    <Italic className="size-3.75" />
                </div>
                <div className="h-7 w-7 flex justify-center items-center">
                    <UnderlineIcon className="size-3.75" />
                </div>
                <div className="h-7 w-7 flex justify-center items-center">
                    <Strikethrough className="size-3.75" />
                </div>
            </motion.div> */}
        </motion.div>
    );
}
