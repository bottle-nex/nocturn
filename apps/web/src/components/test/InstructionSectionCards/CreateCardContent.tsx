'use client';
import VoiceIcon from '@/components/ui/svg/VoiceIcon';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { JSX } from 'react';
import { BiSearchAlt } from 'react-icons/bi';
import { GrSend } from 'react-icons/gr';
import { HiOutlineRocketLaunch } from 'react-icons/hi2';
import { IoIosPeople } from 'react-icons/io';
import { PiBroomFill } from 'react-icons/pi';
import { SiSolana } from 'react-icons/si';

export function CreateCardContent(): JSX.Element {
    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            className="w-55 h-55 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha shrink-0 flex justify-center items-center relative"
        >
            <FloatItem x={-8} y={-84}>
                <div className="bg-amber-50 ring-1 ring-amber-300 h-7 w-7 rounded-full flex justify-center items-center">
                    <HiOutlineRocketLaunch className="text-amber-600 size-4.5" />
                </div>
            </FloatItem>

            <FloatItem x={55} y={22}>
                <div className="bg-indigo-50 ring-1 ring-indigo-300 shadow-xs h-7 w-7 shadow-black/5 flex justify-center items-center rounded-full">
                    <SiSolana className="text-indigo-600 size-3.5 -rotate-6" />
                </div>
            </FloatItem>

            <FloatItem x={-73} y={23}>
                <div className="bg-pink-50 ring-1 ring-pink-300 shadow-xs shdaow-black/5 flex justify-center items-center h-7 w-7 rounded-full">
                    <PiBroomFill className="text-pink-600/70 size-4 -rotate-6" />
                </div>
            </FloatItem>

            <FloatItem x={-60} y={-68} flip>
                <div className="bg-cyan-50 ring-1 ring-cyan-300 shadow-xs shdaow-black/5 flex justify-center items-center h-7 w-7 rounded-full">
                    <GrSend className="text-cyan-600 size-4" />
                </div>
            </FloatItem>

            <FloatItem x={43} y={-64} flip>
                <div className="bg-green-50 h-7 w-7 flex justify-center items-center ring-1 ring-green-300 shadow-xs shadow-black/5 rounded-full">
                    <BiSearchAlt className="text-green-600 size-4.5" />
                </div>
            </FloatItem>

            <FloatItem x={-82} y={-26} rotate={-5}>
                <div className="bg-red-50 h-7 w-7 flex justify-center items-center ring-1 ring-red-300 shadow-xs shadow-black/5 rounded-full">
                    <IoIosPeople className="text-red-600 size-4.75" />
                </div>
            </FloatItem>

            <FloatItem x={61} y={-23} rotate={8}>
                <div className="bg-purple-50 h-7 w-7 flex justify-center items-center ring-1 ring-purple-300 shadow-xs shadow-black/5 rounded-full">
                    <VoiceIcon className="text-purple-600 size-5" />
                </div>
            </FloatItem>

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
            className={`absolute left-1/2 top-1/2 pointer-events-none ${className}`}
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
            {children}
        </motion.div>
    );
}
