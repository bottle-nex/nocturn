'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

const barGlow =
    'relative w-10 rounded-md bg-linear-to-b from-alpha via-alpha/40 to-transparent ' +
    'after:absolute after:inset-0 after:rounded-md after:bg-alpha/40 after:blur-md after:-z-10 ' +
    'drop-shadow-[0_0_10px_rgba(79,70,229,0.2)]';

export default function LandingSectionRightCard() {
    const [hoverBars, setHoverBars] = useState<boolean>(false);

    return (
        <motion.div
            initial={{
                scale: 0.6,
                opacity: 0,
                y: 100,
            }}
            animate={{
                scale: 1,
                opacity: 1,
                y: 0,
            }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.5,
            }}
            onMouseEnter={() => setHoverBars(true)}
            onMouseLeave={() => setHoverBars(false)}
            className="h-80 w-78 rounded-4xl ring-4 ring-white bg-linear-to-b from-neutral-300/50 via-neutral-200/50 to-neutral-100/50 shadow-xl absolute top-2 right-[11%] p-6 flex flex-col justify-between rotate-4 overflow-hidden"
        >
            <div className="relative h-50 w-full flex justify-between items-end px-4 top-4 mt-2">
                <motion.div
                    initial={false}
                    animate={
                        hoverBars
                            ? { x: '140%', y: '140%', opacity: 1 }
                            : { x: '-140%', y: '-140%', opacity: 0 }
                    }
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="pointer-events-none absolute inset-0 z-20"
                >
                    <div
                        className={cn(
                            'absolute -inset-32',
                            'rotate-12',
                            'bg-linear-to-br',
                            'from-transparent',
                            'via-white/70',
                            'to-transparent',
                            'blur-xl',
                            'opacity-90',
                            'mask-[linear-gradient(to_bottom,transparent,black,transparent)]',
                        )}
                    />
                </motion.div>

                <div className={cn(barGlow, 'h-25')} />
                <div className={cn(barGlow, 'h-15')} />
                <div className={cn(barGlow, 'h-40')} />
                <div className={cn(barGlow, 'h-23')} />
            </div>
            <div className="w-full flex flex-col gap-y-2 mt-1">
                <div className="text-dark-base/70">STEP 3</div>
                <div className="text-dark-base/50">
                    Launch the quiz and see votes roll in, leaderboards change, and spectators
                    engage in real time
                </div>
            </div>
        </motion.div>
    );
}
