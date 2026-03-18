'use client';
import VoiceIcon from '@/components/ui/svg/VoiceIcon';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { JSX } from 'react';
import { BiSearchAlt } from 'react-icons/bi';
import { GrSend } from 'react-icons/gr';
import { HiOutlineRocketLaunch } from 'react-icons/hi2';
import { IoIosPeople } from 'react-icons/io';
import { PiBroomFill, PiMoneyWavyLight } from 'react-icons/pi';
import { SiSolana } from 'react-icons/si';

const floatingIcons = [
    {
        icon: <HiOutlineRocketLaunch className="text-amber-600 size-4.5" />,
        style: 'bg-amber-50 ring-amber-300',
    },
    {
        icon: <BiSearchAlt className="text-green-600 size-4.5" />,
        style: 'bg-green-50 ring-green-300',
        flip: true,
    },
    {
        icon: <VoiceIcon className="text-purple-600 size-5" />,
        style: 'bg-purple-50 ring-purple-300',
        rotate: 8,
    },
    {
        icon: <SiSolana className="text-indigo-600 size-3.5 -rotate-6" />,
        style: 'bg-indigo-50 ring-indigo-300',
    },
    {
        icon: <PiMoneyWavyLight className="text-slate-600 size-4.5" />,
        style: 'bg-slate-50 ring-slate-300',
    },
    {
        icon: <PiBroomFill className="text-pink-600/70 size-4 -rotate-6" />,
        style: 'bg-pink-50 ring-pink-300',
    },
    {
        icon: <IoIosPeople className="text-red-600 size-4.75" />,
        style: 'bg-red-50 ring-red-300',
        rotate: -5,
    },
    {
        icon: <GrSend className="text-cyan-600 size-4" />,
        style: 'bg-cyan-50 ring-cyan-300',
        flip: true,
    },
];

function getCircularPosition(index: number, total: number, radius: number) {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;

    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
    };
}

export function CreateCardContent(): JSX.Element {
    const RING_SIZE = 125;
    const ICON_SIZE = 28;
    const radius = RING_SIZE / 2 + ICON_SIZE / 2;

    const total = floatingIcons.length;

    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            className="w-55 h-55 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha shrink-0 flex justify-center items-center relative"
        >
            {/* <div className='w-45 h-45 rounded-full ring-1 ring-black/20 absolute' /> */}

            {floatingIcons.map((item, i) => {
                const { x, y } = getCircularPosition(i, total, radius);

                return (
                    <FloatItem key={i} x={x} y={y} rotate={item.rotate} flip={item.flip}>
                        <div
                            className={`h-7 w-7 rounded-full flex justify-center items-center ring-1 shadow-xs shadow-black/5 ${item.style}`}
                        >
                            {item.icon}
                        </div>
                    </FloatItem>
                );
            })}

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

type FloatItemProps = {
    children: React.ReactNode;
    x: number;
    y: number;
    className?: string;
    rotate?: number;
    flip?: boolean;
};

function FloatItem({ children, x, y, className, rotate = 0, flip = false }: FloatItemProps) {
    return (
        <motion.div
            className={`absolute left-1/2 top-1/2 pointer-events-none ${className ?? ''}`}
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
                translateX: '-50%',
                translateY: '-50%',
                scaleX: flip ? -1 : 1,
            }}
        >
            {children}
        </motion.div>
    );
}
