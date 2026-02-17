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
            className="w-55 h-55 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha shrink-0 flex justify-center items-center relative"
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
