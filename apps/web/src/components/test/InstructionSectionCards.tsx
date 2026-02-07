'use client';
import { JSX } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FiCheck, FiZap } from 'react-icons/fi';
import Image from 'next/image';
import { RxCross2 } from 'react-icons/rx';
import { GrSend } from 'react-icons/gr';
import { HiOutlineRocketLaunch } from 'react-icons/hi2';
import { BiSearchAlt } from 'react-icons/bi';
import { PiBroomFill } from 'react-icons/pi';
import VoiceIcon from '../ui/svg/VoiceIcon';
import { IoIosPeople } from 'react-icons/io';
import { SiSolana } from 'react-icons/si';

type IconProps = {
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    x: number;
    y: number;
    className?: string;
    size?: number | string;
    rotate?: number;
    flip?: boolean;
};

function Icon({ Icon, x, y, className, size = 'size-5', rotate = 0, flip = false }: IconProps) {
    return (
        <motion.div
            className="absolute left-1/2 top-1/2 pointer-events-none"
            variants={{
                rest: {
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0,
                },
                hover: {
                    x,
                    y,
                    scale: 1,
                    opacity: 1,
                },
            }}
            transition={{
                type: 'spring',
                stiffness: 500,
                damping: 18,
                mass: 0.6,
            }}
            style={{
                rotate,
                transform: `translate(-50%, -50%) ${flip ? 'scaleX(-1)' : ''}`,
            }}
        >
            <Icon className={`${size} ${className}`} />
        </motion.div>
    );
}

export function CreateCardContent(): JSX.Element {
    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            className="w-50 h-50 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha shrink-0 flex justify-center items-center relative overflow-hidden"
        >
            <Icon
                Icon={HiOutlineRocketLaunch}
                className="text-amber-600"
                x={-5}
                y={-80}
                size="size-6"
            />

            <Icon
                Icon={SiSolana}
                className="text-indigo-600 -rotate-6"
                x={53}
                y={19}
                size="size-4"
            />

            <Icon
                Icon={PiBroomFill}
                className="text-pink-600/70 -rotate-6"
                x={-70}
                y={20}
                size="size-5"
            />

            <Icon Icon={GrSend} className="text-cyan-600" x={-57} y={-64} size="size-5" flip />

            <Icon Icon={BiSearchAlt} className="text-green-600" x={42} y={-60} size="size-6" flip />

            <Icon
                Icon={IoIosPeople}
                className="text-red-600"
                x={-76}
                y={-23}
                size="size-5.5"
                rotate={-5}
            />

            <Icon
                Icon={VoiceIcon}
                className="text-purple-600"
                x={58}
                y={-20}
                size="size-5"
                rotate={8}
            />

            {/* CENTER IMAGE */}
            <div className="h-24 w-24 bg-light-base rounded-full flex justify-center items-center relative overflow-hidden z-10 ring-1 ring-black/10 shadow-sm shadow-black/5">
                <Image
                    src="/illustrations/coffee_guy.png"
                    alt=""
                    fill
                    unoptimized
                    className="object-contain mt-3"
                />
            </div>
        </motion.div>
    );
}

const flipTransition = {
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1] as const,
};

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

const rowVariants = {
    initial: {
        rotateX: 0,
        transition: flipTransition,
    },
    hover: {
        rotateX: 180,
        transition: flipTransition,
    },
};

export function PublishCardContent(): JSX.Element {
    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            whileHover="hover"
            className={cn(
                'w-50 h-50 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl',
                'bg-light-alpha shrink-0 flex flex-col justify-around',
                'relative overflow-hidden p-5 px-6',
                'transition-all duration-300 hover:-translate-y-1.5 hover:scale-105',
            )}
            style={{ perspective: 1200 }}
        >
            <motion.div
                variants={rowVariants}
                className="relative w-full h-8"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* front */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-sm ring-1 ring-black/10',
                        'shadow-xs shadow-black/5 px-5 flex items-center justify-center',
                        'bg-light-alpha',
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-2 w-full bg-indigo-500 rounded-full" />
                </div>

                {/* back */}
                <div
                    className={cn(
                        'absolute inset-0 rounded-sm',
                        'flex items-center gap-x-2 px-2',
                        'bg-indigo-200 text-sm tracking-wide text-neutral-700',
                        'ring-1 ring-indigo-400',
                    )}
                    style={{
                        transform: 'rotateX(180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {/* <div className="h-6 w-6 flex items-center justify-center shrink-0">
                        <LuSave className="h-3.5 w-3.5 text-indigo-600" />
                    </div> */}

                    <div className="flex-1 h-6 rounded-full text-indigo-600 text-[13px] flex items-center px-3 justify-center">
                        SAVE DRAFT
                    </div>
                </div>
            </motion.div>

            {/* PUBLISH QUIZ */}
            <motion.div
                variants={rowVariants}
                className="relative w-full h-8"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div
                    className={cn(
                        'absolute inset-0 rounded-sm ring-1 ring-black/10',
                        'shadow-xs shadow-black/5 px-5 flex items-center justify-center',
                        'bg-light-alpha',
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-2 w-full bg-red-500 rounded-full" />
                </div>

                <div
                    className={cn(
                        'absolute inset-0 rounded-sm',
                        'flex items-center gap-x-2 px-2',
                        'bg-red-100 text-sm tracking-wide text-neutral-700',
                        'ring-1 ring-red-400/80',
                    )}
                    style={{
                        transform: 'rotateX(180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    {/* <div className="h-6 w-6 flex items-center justify-center shrink-0">
                        <LuSave className="h-3.5 w-3.5 text-indigo-600" />
                    </div> */}

                    <div className="flex-1 h-6 rounded-full text-red-600/80 flex items-center px-3 justify-center text-[13px]">
                        PUBLISH QUIZ
                    </div>
                </div>
            </motion.div>

            {/* LAUNCH QUIZ */}
            <motion.div
                variants={rowVariants}
                className="relative w-full h-8"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div
                    className={cn(
                        'absolute inset-0 rounded-sm ring-1 ring-black/10',
                        'shadow-xs shadow-black/5 px-5 flex items-center justify-center',
                        'bg-light-alpha',
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="h-2 w-full bg-amber-500 rounded-full" />
                </div>

                <div
                    className={cn(
                        'absolute inset-0 rounded-sm',
                        'flex items-center gap-x-2 px-2',
                        'bg-amber-100 text-sm tracking-wide text-neutral-700',
                        'ring-1 ring-amber-400',
                    )}
                    style={{
                        transform: 'rotateX(180deg)',
                        backfaceVisibility: 'hidden',
                    }}
                >
                    <div className="flex-1 h-6 rounded-full text-amber-600 flex items-center px-3 justify-center text-[13px]">
                        LAUNCH QUIZ
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export function LaunchCardContent(): JSX.Element {
    return (
        <div className="w-50 h-50 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha shrink-0 relative group">
            <div className="absolute top-3.5 left-3.5 bg-light-base flex justify-center items-center cursor-pointer hover:bg-neutral-200/70 transition-colors transform duration-200 text-neutral-500 px-2 py-0.5 text-xs rounded-sm ring-1 ring-neutral-200">
                Stake SOL
            </div>
            <div className="p-6 h-full flex gap-5 relative rounded-sm">
                <div className="flex-1 flex flex-col justify-end gap-3 pb-2 relative z-2">
                    <div className="h-2.5 bg-dark-faded/70 rounded-full" />
                    <div className="h-2 bg-dark-faded rounded-full w-full" />
                    <div className="h-2 bg-dark-faded/70 rounded-full w-3/4" />
                </div>
                <div className="flex flex-col items-center justify-end gap-5 relative z-2">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all transform duration-300">
                        <FiZap className="text-white" />
                    </div>
                    <div className="text-[9px] font-black px-4 py-2 bg-slate-900 text-white rounded-md">
                        Wallet
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ManageCardContent(): JSX.Element {
    return (
        <motion.div
            initial="initial"
            whileHover="hover"
            className="w-50 h-50 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-white shrink-0 overflow-hidden"
        >
            <div className="relative p-4 h-full flex items-center justify-center">
                <div className="relative w-full h-[180px]">
                    <UserRow
                        imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg"
                        success
                        slots={[0, 2, 1]}
                    />

                    <UserRow
                        imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg"
                        success={false}
                        slots={[1, 0, 2]}
                    />

                    <UserRow
                        imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg"
                        success
                        slots={[2, 1, 0]}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function UserRow({
    success,
    imgUrl,
    slots,
}: {
    success: boolean;
    imgUrl: string;
    slots: number[];
}): JSX.Element {
    const ROW_HEIGHT = 44;
    const ROW_GAP = 10;
    const SLOT = ROW_HEIGHT + ROW_GAP;

    return (
        <motion.div
            className="absolute left-0 right-0"
            variants={{
                initial: {
                    y: slots[0] * SLOT,
                },
                hover: {
                    y: slots.map((s) => s * SLOT),
                },
            }}
            transition={{
                duration: 2,
                ease: [0.22, 1, 0.36, 1],
                repeat: Infinity,
                repeatType: 'loop',
            }}
        >
            <div className="flex items-center gap-3 p-2 bg-light-base rounded-xl ring-1 ring-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 overflow-hidden relative">
                    <Image src={imgUrl} alt="img" fill unoptimized className="object-cover" />
                </div>

                <div className="flex-1 h-1.5 bg-light-base rounded-full overflow-hidden relative">
                    <div
                        className={`absolute left-0 top-0 h-full ${
                            success ? 'bg-indigo-500 w-full' : 'bg-neutral-400/80 w-1/3'
                        }`}
                    />
                </div>

                <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        success ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                    }`}
                >
                    {success ? <FiCheck className="w-3 h-3" /> : <RxCross2 className="w-3 h-3" />}
                </div>
            </div>
        </motion.div>
    );
}
