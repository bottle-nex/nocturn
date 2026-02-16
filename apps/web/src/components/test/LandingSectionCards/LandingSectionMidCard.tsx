'use client';

import Image from 'next/image';
import { PiMoneyWavyLight, PiSmileyXEyes } from 'react-icons/pi';
import { motion } from 'framer-motion';

export default function LandingSectionMidCard() {
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
            className="h-82 w-80 rounded-4xl ring-4 ring-white bg-linear-to-b from-neutral-300/50 via-neutral-200/50 to-neutral-100/50 shadow-xl absolute -top-1 left-1/2 -translate-x-1/2 p-6 flex flex-col justify-between overflow-hidden group"
        >
            <div className="h-50 w-full relative">
                <div className="absolute h-12 w-41 bg-[#f8f8f8] rounded-xl ring-1 ring-black/5 shadow-xs shadow-black/10 top-2 right-0 z-2 flex gap-x-1 items-center px-3 rotate-3 group-hover:blur-[1px] transition-all transform duration-200">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0 ring-1 ring-green-500 shadow-xs shadow-black/5 flex justify-center items-center bg-green-100/60">
                        <PiMoneyWavyLight className="text-green-600 size-5.5 stroke-2" />
                    </div>
                    <div className="w-full h-8 flex flex-col pl-1.5 justify-between">
                        <div className="text-xs text-dark-base/60">Connect Wallet</div>
                        <div className="text-dark-base/90 text-[11px] leading-3 pb-0.5">
                            Add money in game
                        </div>
                    </div>
                </div>

                <div className="absolute h-16 w-48 bg-[#f8f8f8] rounded-xl ring-1 ring-black/5 shadow-xs shadow-black/10 top-13 left-3 flex gap-x-1 items-center px-3 -rotate-3 z-3 group-hover:scale-105 group-hover:rotate-1 transition-all transform duration-250">
                    <div className="relative h-11 w-11 rounded-full overflow-hidden shrink-0 ring-1 ring-black/30 shadow-xs shadow-black/5">
                        <Image
                            src={'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg'}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                        />
                    </div>
                    <div className="w-full h-11 flex flex-col justify-between pl-1">
                        <div className="text-xs text-dark-base/60">Piyush Raj</div>
                        <div className="text-dark-base/90 text-[11px] leading-3">
                            Added modern theme and base points per Q
                        </div>
                    </div>
                </div>

                <div className="absolute h-12 w-44 bg-[#f8f8f8] rounded-xl ring-1 ring-black/5 shadow-xs shadow-black/10 bottom-3 right-8 z-0 flex gap-x-1 items-center px-3 rotate-3 group-hover:blur-[1px] transition-all transform duration-200">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0 ring-1 ring-amber-500 shadow-xs shadow-black/5 flex justify-center items-center bg-amber-100/60">
                        <PiSmileyXEyes className="text-amber-600 size-5.5 stroke-2" />
                    </div>
                    <div className="w-full h-8 flex flex-col pl-1.5 justify-between">
                        <div className="text-xs text-dark-base/60">Add Interactions</div>
                        <div className="text-dark-base/90 text-[11px] leading-3 pb-0.5">
                            Enhance engagement
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col gap-y-2">
                <div className="text-dark-base/70">STEP 2</div>
                <div className="text-dark-base/50">
                    Build your quiz, customize the design, collaborate with others, set scoring
                    rules, and put your SOL on the line.
                </div>
            </div>
        </motion.div>
    );
}
