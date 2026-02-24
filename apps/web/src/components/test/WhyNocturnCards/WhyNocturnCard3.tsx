'use client';
import { cn } from '@/lib/utils';
import { IoIosArrowUp } from 'react-icons/io';
import { motion, Variants } from 'framer-motion';
import { SiSolana } from 'react-icons/si';
import { GrMoney } from 'react-icons/gr';
import { LuTvMinimalPlay } from 'react-icons/lu';
import { useState } from 'react';
import { IoWalletOutline } from 'react-icons/io5';

export default function WhyNocturnCard3() {
    const [open, setOpen] = useState(false);

    const itemVariants: Variants = {
        closed: { y: 120, opacity: 0 },
        open: (i: number) => ({
            y: 0,
            opacity: 1,
            transition: { delay: i * 0.12, duration: 0.45, ease: 'easeOut' },
        }),
    };

    return (
        <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="h-[58vh] w-full max-w-93 shadow-xs shadow-black/5 rounded-4xl bg-[#b5a6ff] flex flex-col py-14 px-10 gap-y-2 relative overflow-hidden"
        >
            <div
                className={cn(
                    'top-59 left-1/2 -translate-x-1/2 h-40 w-40',
                    'bg-[#f0edff] shadow-md shadow-black/10 text-dark-base',
                    'absolute flex items-center justify-center rounded-3xl overflow-hidden',
                    'ring-4 ring-light-base/60',
                )}
            >
                <motion.div
                    animate={open ? 'closed' : 'open'}
                    variants={{
                        open: { y: 0, opacity: 1 },
                        closed: { y: -220, opacity: 0 },
                    }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    className="absolute"
                >
                    <SiSolana className="size-15 text-[#a698f3]" />
                </motion.div>

                <div className="flex flex-col justify-between w-full h-full p-2 gap-2">
                    {[
                        { icon: <IoWalletOutline className="size-4.5" />, text: 'Link the wallet' },
                        { icon: <GrMoney className="size-4.5" />, text: 'Recharge SOL' },
                        { icon: <LuTvMinimalPlay className="size-4.5" />, text: 'Launch game' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            animate={open ? 'open' : 'closed'}
                            variants={itemVariants}
                            className="flex justify-around px-2 bg-light-alpha rounded-2xl items-center h-full ring-1 ring-black/10 shadow-xs shadow-black/5 text-[14px]"
                        >
                            {item.icon}
                            {item.text}
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 top-104">
                <motion.div
                    animate={open ? { scale: 0, rotate: 180 } : { scale: 1, rotate: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-8 w-8 bg-light-base rounded-full flex justify-center items-center shadow-xs shadow-black/5 ring-1 ring-light-base/50 absolute left-1/2 -translate-x-1/2"
                >
                    <IoIosArrowUp className="text-dark-base" />
                </motion.div>

                <motion.div
                    animate={open ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-full h-8 w-8 bg-light-base shadow ring-1 ring-black/10 text-[13px] text-dark-base flex justify-center items-center"
                >
                    <SiSolana />
                </motion.div>
            </div>

            <div className="bg-dark-base text-light-base w-fit px-2.5 text-base py-px rounded-xs">
                Powered By Solana
            </div>
            <div className="text-[#1c1542] text-[15px] font-extralight tracking-wide">
                Connect your wallet, add SOL, back a quiz, and launch the game instantly,
                transparent and competitive, designed to reward confident knowledge in real time
                with every round played.
            </div>
        </div>
    );
}
